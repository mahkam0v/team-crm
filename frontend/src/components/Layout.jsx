import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Icon } from './Icon.jsx';
import { Avatar } from './Avatar.jsx';
import { CommandPalette } from './CommandPalette.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/projects', label: 'Loyihalar', icon: 'projects' },
  { to: '/tasks', label: 'Vazifalar', icon: 'tasks' },
  { to: '/finance', label: 'Moliya', icon: 'finance' },
];

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    api.listNotifications().then((r) => setNotifications(r.notifications)).catch(() => {});
  }, []);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const results = await api.search(q);
      setSearchResults(results.results || []);
      setShowSearch(true);
    } catch {
      setSearchResults([]);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          flex flex-col
          border-r border-white/[0.04]
          transition-all duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-[232px]' : 'w-[60px]'}
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(15,17,23,0.99) 0%, rgba(8,9,13,1) 100%)',
        }}
      >
        {/* Logo */}
        <div className="px-3.5 pt-4 pb-3 mb-1">
          <div className="flex items-center justify-between">
            <div
              className="font-display font-bold text-[15px] tracking-tight cursor-pointer select-none"
              onClick={() => { navigate('/'); closeMobile(); }}
            >
              {sidebarOpen ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                    <Icon name="dashboard" className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="text-white">Team</span>
                    <span className="text-accent">CRM</span>
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto">
                  <Icon name="dashboard" className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md hover:bg-white/[0.05] text-muted hover:text-white transition-colors"
            >
              <Icon name={sidebarOpen ? 'chevron_left' : 'chevron_right'} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-2.5 py-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/10 text-white'
                    : 'text-muted hover:text-white/80 hover:bg-white/[0.03]'
                }`
              }
            >
              <Icon name={item.icon} className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/10 text-white'
                    : 'text-muted hover:text-white/80 hover:bg-white/[0.03]'
                }`
              }
            >
              <Icon name="admin" className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Admin</span>}
            </NavLink>
          )}
        </nav>

        {/* User section */}
        <div className="mt-auto pt-2.5 border-t border-white/[0.04] px-2.5 pb-2.5">
          <button
            onClick={() => { navigate('/profile'); closeMobile(); }}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <Avatar username={user?.username || '?'} size={8} showStatus={user?.status} />
            {sidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[12.5px] font-medium text-white/85 truncate">{user?.username}</div>
                <div className="text-[10px] text-muted/50 truncate">{user?.email}</div>
              </div>
            )}
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-muted hover:text-negative hover:bg-negative/5 transition-colors mt-0.5"
          >
            <Icon name="logout" className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 glass-light border-b border-white/[0.04] flex items-center px-4 lg:px-5 gap-3 sticky top-0 z-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-ghost p-1.5"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-md" ref={searchRef}>
            <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
            <input
              className="field mb-0 pl-8 pr-16 py-1.5 text-[12.5px] bg-white/[0.02] border-white/[0.04] focus:bg-white/[0.05] focus:border-accent/25"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSearch(true)}
            />
            <button
              onClick={() => setCmdOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-muted/30 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5 hover:bg-white/[0.06] transition-colors"
            >
              <kbd className="font-mono">⌘K</kbd>
            </button>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/[0.08] rounded-xl shadow-elevated z-50 max-h-80 overflow-y-auto animate-fade-in-scale">
                {searchResults.slice(0, 10).map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (r.type === 'project') navigate(`/projects/${r.id}`);
                      else if (r.type === 'task') navigate('/tasks');
                      else if (r.type === 'transaction') navigate('/finance');
                      else if (r.type === 'user') navigate('/profile');
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0"
                  >
                    <Icon
                      name={r.type === 'project' ? 'folder' : r.type === 'transaction' ? 'receipt' : r.type === 'user' ? 'user' : 'clipboard'}
                      className="w-3.5 h-3.5 text-muted/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium truncate">{r.name || r.title || r.username}</div>
                      <div className="text-[10.5px] text-muted/50 capitalize">{r.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif((s) => !s)} className="relative btn-ghost p-2 rounded-lg">
                <Icon name="bell" className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] flex items-center justify-center bg-negative text-white rounded-full font-mono font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-5rem)] glass border border-white/[0.08] rounded-xl shadow-elevated z-50 max-h-96 overflow-y-auto animate-fade-in-scale">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                    <span className="text-[12.5px] font-semibold">Bildirishnomalar</span>
                    <button onClick={handleMarkAllRead} className="text-[11px] text-accent hover:text-accent-light transition-colors">
                      Hammasini o'qilgan qilish
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-[12.5px] text-muted/50 p-6 text-center">Bildirishnoma yo'q</p>
                  ) : (
                    notifications.slice(0, 15).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-2.5 text-[12px] border-b border-white/[0.03] last:border-0 transition-colors hover:bg-white/[0.03] ${
                          n.isRead ? 'text-muted/60' : 'text-white/80'
                        }`}
                      >
                        {!n.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2" />}
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="animate-fade-in max-w-[1400px] mx-auto" key={pathname}>
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} isAdmin={isAdmin} />
    </div>
  );
};
