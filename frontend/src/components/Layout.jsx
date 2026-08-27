import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Icon } from './Icon.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/projects', label: 'Loyihalar', icon: 'projects' },
  { to: '/tasks', label: 'Vazifalar', icon: 'tasks' },
  { to: '/finance', label: 'Moliya', icon: 'finance' },
];

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    api.listNotifications().then((r) => setNotifications(r.notifications)).catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenNotif = async () => {
    setShowNotif((s) => !s);
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="bg-surface border-r border-border p-4 flex flex-col">
        <div className="font-display font-semibold text-[15px] tracking-tight pb-4 mb-3 border-b border-border px-2">
          Team<span className="text-accent">CRM</span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded text-[13.5px] font-medium transition-colors ${
                  isActive ? 'bg-accent-dim text-white' : 'text-muted hover:text-white hover:bg-raised'
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded text-[13.5px] font-medium transition-colors ${
                  isActive ? 'bg-accent-dim text-white' : 'text-muted hover:text-white hover:bg-raised'
                }`
              }
            >
              <Icon name="admin" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="mt-auto pt-3 border-t border-border">
          <button
            onClick={() => navigate('/profile')}
            className="w-full text-left px-2.5 pb-2 text-[12.5px] text-muted hover:text-white transition-colors"
          >
            <span className="text-white font-medium">{user?.username}</span>
            <div className="inline-block ml-2 font-mono text-[10px] tracking-wide text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              {user?.role}
            </div>
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-[13.5px] font-medium text-muted hover:text-negative hover:bg-raised transition-colors"
          >
            <Icon name="logout" />
            Chiqish
          </button>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-end px-6 gap-3 relative">
          <button onClick={handleOpenNotif} className="relative btn-ghost p-2">
            <Icon name="bell" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] flex items-center justify-center bg-negative text-white rounded-full font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute top-12 right-6 w-80 bg-surface border border-border rounded shadow-xl z-20 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-[13px] font-semibold">Bildirishnomalar</span>
                <button onClick={handleMarkAllRead} className="text-[12px] text-accent hover:underline">
                  Hammasini o'qilgan qilish
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-[13px] text-muted p-4">Bildirishnoma yo'q</p>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <div key={n.id} className={`px-4 py-3 text-[12.5px] border-b border-border last:border-0 ${n.isRead ? 'text-muted' : 'text-white'}`}>
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
