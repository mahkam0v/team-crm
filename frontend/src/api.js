const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const REFRESH_TOKEN_KEY = 'refreshToken';

// Access token lives in memory only; the refresh token (long-lived) is stored
// in localStorage so the session survives reloads and can be revoked server-side.
let accessToken = null;
let refreshPromise = null;

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getAccessToken = () => accessToken;

export const setTokens = ({ accessToken: at, refreshToken: rt }) => {
  if (at) accessToken = at;
  if (rt) localStorage.setItem(REFRESH_TOKEN_KEY, rt);
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const notifyAuthExpired = () => {
  window.dispatchEvent(new Event('auth:expired'));
};

// Single-flight refresh: several requests may 401 at once, but we only call
// /auth/refresh once and queue them behind the same promise.
const refreshAccessToken = async () => {
  const rt = getRefreshToken();
  if (!rt) {
    clearTokens();
    notifyAuthExpired();
    throw new Error('Sessiya tugadi');
  }
  if (!refreshPromise) {
    refreshPromise = (async () => {
      let res;
      try {
        res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
      } catch {
        throw new Error('Serverga ulanib bo‘lmadi');
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        clearTokens();
        notifyAuthExpired();
        throw new Error(data.error || 'Sessiya tugadi');
      }
      setTokens(data); // new access token + rotated refresh token
      return data;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// These endpoints must never trigger the refresh flow themselves.
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

const request = async (method, path, body, isForm = false, retried = false) => {
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (!isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Serverga ulanib bo‘lmadi');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !retried && !NO_REFRESH_PATHS.includes(path)) {
    try {
      await refreshAccessToken();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Sessiya tugadi');
    }
    return request(method, path, body, isForm, true);
  }

  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
};

export const api = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  me: () => request('GET', '/auth/me'),
  logout: () => request('POST', '/auth/logout', { refreshToken: getRefreshToken() }),
  changePassword: (body) => request('POST', '/auth/change-password', body),

  listUsers: () => request('GET', '/users'),
  userDirectory: () => request('GET', '/users/directory'),
  createUser: (body) => request('POST', '/users', body),
  disableUser: (id) => request('PATCH', `/users/${id}/disable`),
  updateProfile: (body) => request('PATCH', '/users/me', body),
  profileStats: () => request('GET', '/users/me/stats'),

  listProjects: (params = {}) => request('GET', `/projects?${new URLSearchParams(params)}`),
  createProject: (body) => request('POST', '/projects', body),
  getProject: (id) => request('GET', `/projects/${id}`),
  updateProject: (id, body) => request('PATCH', `/projects/${id}`, body),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),
  getProjectMembers: (id) => request('GET', `/projects/${id}/members`),
  addProjectMember: (id, userId) => request('POST', `/projects/${id}/members`, { userId }),
  removeProjectMember: (id, userId) => request('DELETE', `/projects/${id}/members/${userId}`),
  getProjectTransactions: (id) => request('GET', `/projects/${id}/transactions`),
  getProjectActivity: (id) => request('GET', `/projects/${id}/activity`),

  getProjectChat: (id) => request('GET', `/projects/${id}/chat`),
  sendProjectChat: (id, message) => request('POST', `/projects/${id}/chat`, { message }),
  deleteProjectChatMessage: (id, messageId) => request('DELETE', `/projects/${id}/chat/${messageId}`),

  listTasks: (projectId) => request('GET', `/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  createTask: (body) => request('POST', '/tasks', body),
  updateTask: (id, body) => request('PATCH', `/tasks/${id}`, body),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
  getTaskComments: (id) => request('GET', `/tasks/${id}/comments`),
  addTaskComment: (id, message) => request('POST', `/tasks/${id}/comments`, { message }),

  listTransactions: () => request('GET', '/transactions'),
  createTransaction: (body) => request('POST', '/transactions', body),
  updateTransactionStatus: (id, status) => request('PATCH', `/transactions/${id}`, { status }),

  listNotifications: () => request('GET', '/notifications'),
  markNotificationRead: (id) => request('PATCH', `/notifications/${id}/read`),
  markAllNotificationsRead: () => request('PATCH', '/notifications/read-all'),

  listFiles: (entityType, entityId) => request('GET', `/files?entityType=${entityType}&entityId=${entityId}`),
  uploadFile: (entityType, entityId, file) => {
    const form = new FormData();
    form.append('entityType', entityType);
    form.append('entityId', entityId);
    form.append('file', file);
    return request('POST', '/files', form, true);
  },
  downloadFile: async (id, filename) => {
    const tryDownload = async () =>
      fetch(`${BASE_URL}/files/${id}/download`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

    let res = await tryDownload();
    if (res.status === 401) {
      await refreshAccessToken().catch(() => {});
      res = await tryDownload();
    }
    if (!res.ok) throw new Error("Yuklab olib bo'lmadi");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  listNotes: (params) => request('GET', `/notes?${new URLSearchParams(params)}`),
  createNote: (body) => request('POST', '/notes', body),
  deleteNote: (id) => request('DELETE', `/notes/${id}`),

  reportSummary: (period = 'this_month') => request('GET', `/reports/summary?period=${period}`),
  reportAnalytics: () => request('GET', '/reports/analytics'),
  activityCalendar: (year) => request('GET', `/activity/calendar${year ? `?year=${year}` : ''}`),
  myAchievements: () => request('GET', '/achievements/me'),
  allAchievements: () => request('GET', '/achievements'),
  search: async (q) => {
    const data = await request('GET', `/search?q=${encodeURIComponent(q)}`);
    const results = [
      ...(data.projects || []).map((p) => ({ type: 'project', id: p.id, name: p.name })),
      ...(data.tasks || []).map((t) => ({ type: 'task', id: t.id, name: t.title })),
      ...(data.users || []).map((u) => ({ type: 'user', id: u.id, name: u.username })),
      ...(data.transactions || []).map((t) => ({
        type: 'transaction',
        id: t.id,
        name: t.description || t.category || 'Tranzaksiya',
      })),
    ];
    return { results };
  },
};
