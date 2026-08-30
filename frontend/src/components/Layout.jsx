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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          w-[220px] flex flex-col
          glass border-r border-white/5
          transition-all duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? '' : 'lg:w-[60px]'}
        `}
      >
        {/* Logo */}
        <div className="p-4 pb-3 mb-1 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-[15px] tracking-tight">
              <span className="gradient-text">Team</span>
              <span className="text-accent">CRM</span>
            </div>
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="hidden lg:flex w-6 h-6 items-center justify-center rounded hover:bg-white/5 text-muted hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d={sidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-2 py-2">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 animate-slide-right stagger-${i + 1} ${
                  isActive
                    ? 'bg-accent/15 text-white shadow-[0_0_15px_rgba(91,141,239,0.1)]'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon name={item.icon} className={`w-4 h-4 shrink-0`} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/15 text-white shadow-[0_0_15px_rgba(91,141,239,0.1)]'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon name="admin" className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Admin</span>}
            </NavLink>
          )}
        </nav>

        {/* User section */}
        <div className="mt-auto pt-3 border-t border-white/5 px-2 pb-2">
          <button
            onClick={() => { navigate('/profile'); closeMobile(); }}
            className="w-full text-left px-2.5 pb-2 text-[12.5px] text-muted hover:text-white transition-colors"
          >
            <span className="text-white font-medium">{user?.username}</span>
            {sidebarOpen && (
              <div className="inline-block ml-2 font-mono text-[10px] tracking-wide text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                {user?.role}
              </div>
            )}
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium text-muted hover:text-negative hover:bg-negative/10 transition-all duration-200"
          >
            <Icon name="logout" className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 glass-light border-b border-white/5 flex items-center px-4 lg:px-6 gap-3 relative sticky top-0 z-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-ghost p-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <button onClick={handleOpenNotif} className="relative btn-ghost p-2 group">
            <Icon name="bell" className="w-4 h-4 group-hover:animate-float" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] flex items-center justify-center bg-negative text-white rounded-full font-mono animate-pulse-glow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotif && (
            <div className="absolute top-14 right-4 w-80 glass border border-white/10 rounded-xl shadow-2xl z-20 max-h-96 overflow-y-auto animate-fade-in-scale">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-[13px] font-semibold">Bildirishnomalar</span>
                <button onClick={handleMarkAllRead} className="text-[12px] text-accent hover:underline">
                  Hammasini o'qilgan qilish
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-[13px] text-muted p-4 text-center">Bildirishnoma yo'q</p>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 text-[12.5px] border-b border-white/5 last:border-0 transition-colors hover:bg-white/5 ${
                      n.isRead ? 'text-muted' : 'text-white'
                    }`}
                  >
                    {!n.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 animate-pulse" />}
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </header>

        {/* Page content with animation */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="animate-fade-in" key={location.pathname}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
