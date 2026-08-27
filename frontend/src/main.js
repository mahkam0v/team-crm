import { api, setToken, clearToken } from './api.js';

const root = document.getElementById('app');
let currentUser = null;
let currentPage = 'dashboard';

const render = async () => {
  if (!localStorage.getItem('token')) return renderAuth();

  try {
    const { user } = await api.me();
    currentUser = user;
  } catch {
    clearToken();
    return renderAuth();
  }

  renderShell();
};

// ---------- AUTH ----------
const renderAuth = () => {
  root.innerHTML = `
    <div class="card" style="max-width:360px;margin:80px auto;">
      <h1>Team CRM</h1>
      <div id="auth-error" class="error"></div>
      <div id="login-form">
        <input id="email" placeholder="Email" />
        <input id="password" type="password" placeholder="Parol" />
        <button id="login-btn">Kirish</button>
        <p style="font-size:13px;">Akkaunt yo'qmi? <a href="#" id="show-register">Ro'yxatdan o'tish</a></p>
      </div>
    </div>
  `;

  document.getElementById('login-btn').onclick = async () => {
    try {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const { token } = await api.login({ email, password });
      setToken(token);
      render();
    } catch (err) {
      document.getElementById('auth-error').textContent = err.message;
    }
  };

  document.getElementById('show-register').onclick = (e) => {
    e.preventDefault();
    renderRegister();
  };
};

const renderRegister = () => {
  root.innerHTML = `
    <div class="card" style="max-width:360px;margin:80px auto;">
      <h1>Ro'yxatdan o'tish</h1>
      <div id="auth-error" class="error"></div>
      <input id="username" placeholder="Username" />
      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Parol (min 8 belgi)" />
      <button id="register-btn">Ro'yxatdan o'tish</button>
      <p style="font-size:13px;">Akkaunt bormi? <a href="#" id="show-login">Kirish</a></p>
    </div>
  `;

  document.getElementById('register-btn').onclick = async () => {
    try {
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const { token } = await api.register({ username, email, password });
      setToken(token);
      render();
    } catch (err) {
      document.getElementById('auth-error').textContent = err.message;
    }
  };

  document.getElementById('show-login').onclick = (e) => {
    e.preventDefault();
    renderAuth();
  };
};

// ---------- SHELL ----------
const renderShell = () => {
  root.innerHTML = `
    <h1>Salom, ${currentUser.username} (${currentUser.role})</h1>
    <nav>
      <button data-page="dashboard">Dashboard</button>
      <button data-page="projects">Loyihalar</button>
      <button data-page="tasks">Vazifalar</button>
      <button data-page="finance">Moliya</button>
      <button id="logout-btn" style="margin-left:auto;">Chiqish</button>
    </nav>
    <div id="page-content"></div>
  `;

  root.querySelectorAll('nav button[data-page]').forEach((btn) => {
    btn.onclick = () => {
      currentPage = btn.dataset.page;
      renderShell();
    };
  });
  document.getElementById('logout-btn').onclick = () => {
    clearToken();
    render();
  };

  root.querySelectorAll('nav button[data-page]').forEach((btn) => {
    if (btn.dataset.page === currentPage) btn.classList.add('active');
  });

  const pageRenderers = {
    dashboard: renderDashboard,
    projects: renderProjects,
    tasks: renderTasks,
    finance: renderFinance,
  };
  pageRenderers[currentPage]();
};

// ---------- DASHBOARD ----------
const renderDashboard = async () => {
  const el = document.getElementById('page-content');
  el.innerHTML = '<p>Yuklanmoqda...</p>';

  const summary = await api.reportSummary('this_month');

  el.innerHTML = `
    <div class="grid">
      <div class="card">
        <div class="stat-label">Daromad (bu oy)</div>
        <div class="stat-value positive">${summary.income.toLocaleString()} so'm</div>
      </div>
      <div class="card">
        <div class="stat-label">Xarajat (bu oy)</div>
        <div class="stat-value negative">${summary.expense.toLocaleString()} so'm</div>
      </div>
      <div class="card">
        <div class="stat-label">Foyda</div>
        <div class="stat-value ${summary.profit >= 0 ? 'positive' : 'negative'}">${summary.profit.toLocaleString()} so'm</div>
      </div>
      <div class="card">
        <div class="stat-label">Kutilayotgan daromad</div>
        <div class="stat-value">${summary.pendingIncome.toLocaleString()} so'm</div>
      </div>
      <div class="card">
        <div class="stat-label">Bajarilgan vazifalar</div>
        <div class="stat-value">${summary.tasksCompleted}</div>
      </div>
      <div class="card">
        <div class="stat-label">Faol kunlar</div>
        <div class="stat-value">${summary.activeDays}</div>
      </div>
    </div>
  `;
};

// ---------- PROJECTS ----------
const renderProjects = async () => {
  const el = document.getElementById('page-content');
  el.innerHTML = '<p>Yuklanmoqda...</p>';

  const { projects } = await api.listProjects();

  el.innerHTML = `
    <div class="card">
      <h2>Yangi loyiha</h2>
      <div id="project-error" class="error"></div>
      <input id="project-name" placeholder="Loyiha nomi" />
      <textarea id="project-desc" placeholder="Tavsif (ixtiyoriy)"></textarea>
      <button id="create-project-btn">Yaratish</button>
    </div>
    <div class="card">
      <h2>Loyihalar</h2>
      ${projects.length === 0 ? '<p>Hali loyiha yo\'q</p>' : ''}
      ${projects
        .map(
          (p) => `<div class="list-item"><span>${p.name}</span><span>${p.status}</span></div>`
        )
        .join('')}
    </div>
  `;

  document.getElementById('create-project-btn').onclick = async () => {
    try {
      const name = document.getElementById('project-name').value;
      const description = document.getElementById('project-desc').value;
      if (!name) return;
      await api.createProject({ name, description: description || undefined });
      renderProjects();
    } catch (err) {
      document.getElementById('project-error').textContent = err.message;
    }
  };
};

// ---------- TASKS ----------
const renderTasks = async () => {
  const el = document.getElementById('page-content');
  el.innerHTML = '<p>Yuklanmoqda...</p>';

  const { tasks } = await api.listTasks();

  el.innerHTML = `
    <div class="card">
      <h2>Yangi vazifa</h2>
      <div id="task-error" class="error"></div>
      <input id="task-title" placeholder="Vazifa nomi" />
      <button id="create-task-btn">Qo'shish</button>
    </div>
    <div class="card">
      <h2>Vazifalar</h2>
      ${tasks.length === 0 ? '<p>Hali vazifa yo\'q</p>' : ''}
      ${tasks
        .map(
          (t) => `
        <div class="list-item">
          <span>${t.title}</span>
          <select data-task-id="${t.id}" class="task-status">
            <option value="TODO" ${t.status === 'TODO' ? 'selected' : ''}>Todo</option>
            <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>Jarayonda</option>
            <option value="COMPLETED" ${t.status === 'COMPLETED' ? 'selected' : ''}>Bajarildi</option>
            <option value="CANCELLED" ${t.status === 'CANCELLED' ? 'selected' : ''}>Bekor qilindi</option>
          </select>
        </div>`
        )
        .join('')}
    </div>
  `;

  document.getElementById('create-task-btn').onclick = async () => {
    try {
      const title = document.getElementById('task-title').value;
      if (!title) return;
      await api.createTask({ title });
      renderTasks();
    } catch (err) {
      document.getElementById('task-error').textContent = err.message;
    }
  };

  root.querySelectorAll('.task-status').forEach((select) => {
    select.onchange = async () => {
      await api.updateTask(select.dataset.taskId, { status: select.value });
    };
  });
};

// ---------- FINANCE ----------
const renderFinance = async () => {
  const el = document.getElementById('page-content');
  el.innerHTML = '<p>Yuklanmoqda...</p>';

  const { transactions } = await api.listTransactions();

  el.innerHTML = `
    <div class="card">
      <h2>Yangi tranzaksiya</h2>
      <div id="tx-error" class="error"></div>
      <select id="tx-type">
        <option value="INCOME">Daromad</option>
        <option value="EXPENSE">Xarajat</option>
      </select>
      <input id="tx-amount" type="number" placeholder="Summasi (so'm)" />
      <input id="tx-desc" placeholder="Sabab / tavsif" />
      <input id="tx-date" type="date" value="${new Date().toISOString().slice(0, 10)}" />
      <select id="tx-status">
        <option value="PENDING">Kutilmoqda</option>
        <option value="RECEIVED_PAID">Bajarildi</option>
      </select>
      <button id="create-tx-btn">Qo'shish</button>
    </div>
    <div class="card">
      <h2>Tranzaksiyalar</h2>
      ${transactions.length === 0 ? '<p>Hali tranzaksiya yo\'q</p>' : ''}
      ${transactions
        .map(
          (t) => `
        <div class="list-item">
          <span>${t.description || t.category || '-'}</span>
          <span class="${t.type === 'INCOME' ? 'positive' : 'negative'}">
            ${t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toLocaleString()} so'm (${t.status})
          </span>
        </div>`
        )
        .join('')}
    </div>
  `;

  document.getElementById('create-tx-btn').onclick = async () => {
    try {
      const type = document.getElementById('tx-type').value;
      const amount = Number(document.getElementById('tx-amount').value);
      const description = document.getElementById('tx-desc').value;
      const date = document.getElementById('tx-date').value;
      const status = document.getElementById('tx-status').value;
      if (!amount || amount <= 0) throw new Error('Summani to\'g\'ri kiriting');

      await api.createTransaction({ type, amount, description, date, status });
      renderFinance();
    } catch (err) {
      document.getElementById('tx-error').textContent = err.message;
    }
  };
};

render();
