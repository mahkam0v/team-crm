import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Skeleton } from '../components/Skeleton.jsx';

const roleColors = {
  SUPER_ADMIN: 'bg-negative/15 text-negative',
  ADMIN: 'bg-warning/15 text-warning',
  USER: 'bg-accent/15 text-accent',
};

export const Admin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'USER' });

  const load = () => api.listUsers().then((r) => setUsers(r.users)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createUser(form);
      setForm({ username: '', email: '', password: '', role: 'USER' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisable = async (id) => {
    await api.disableUser(id);
    load();
  };

  return (
    <div>
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold tracking-tight">Admin — Foydalanuvchilar</h1>
        <p className="text-muted text-[13px] mt-0.5">{users.length} ta foydalanuvchi</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="card mb-5 animate-fade-in stagger-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-3">Yangi user</h2>
        {error && (
          <div className="bg-negative/10 border border-negative/20 text-negative text-[12.5px] rounded-lg px-3 py-2 mb-3 animate-fade-in">
            {error}
          </div>
        )}
        <div className="grid sm:grid-cols-5 gap-2">
          <input className="field mb-0" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="field mb-0" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field mb-0" type="password" placeholder="Parol" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="field mb-0" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="USER">User</option>
            {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
          </select>
          <button className="btn-primary">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Yaratish
            </span>
          </button>
        </div>
      </form>

      {/* Users list */}
      <div className="card animate-fade-in stagger-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-1">Barcha foydalanuvchilar</h2>
        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="w-16 h-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Avatar username={u.username} size={8} />
                  <div>
                    <span className="text-[13.5px] font-medium group-hover:text-white transition-colors">{u.username}</span>
                    <span className="text-[12px] text-muted ml-2">{u.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-md ${roleColors[u.role] || roleColors.USER}`}>
                    {u.role}
                  </span>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => handleDisable(u.id)}
                      className="text-[12px] text-negative/70 hover:text-negative hover:underline transition-colors"
                    >
                      Bloklash
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
