const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

const request = async (method, path, body, isForm = false) => {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
};

export const api = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  me: () => request('GET', '/auth/me'),
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
    const res = await fetch(`${BASE_URL}/files/${id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Yuklab olib bo\'lmadi');
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
  search: (q) => request('GET', `/search?q=${encodeURIComponent(q)}`),
};
