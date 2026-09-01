import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/Icon.jsx';

const roleColors = {
  SUPER_ADMIN: 'bg-negative/10 text-negative',
  ADMIN: 'bg-warning/10 text-warning',
  USER: 'bg-accent/10 text-accent',
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
      <div className="mb-5 animate-fade-in">
        <h1 className="font-display text-[24px] font-bold tracking-tight">
          <span className="gradient-text">Admin</span>
        </h1>
        <p className="text-muted/60 text-[12.5px] mt-0.5">{users.length} ta foydalanuvchi</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="card mb-4 animate-fade-in stagger-1">
        <h2 className="section-heading"><h2>Yangi user</h2></h2>
        {error && (
          <div className="bg-negative/8 border border-negative/15 text-negative text-[12px] rounded-lg px-3 py-2 mb-3 animate-fade-in">
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
              <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
              Yaratish
            </span>
          </button>
        </div>
      </form>

      {/* Users list */}
      <div className="card animate-fade-in stagger-2">
        <h2 className="section-heading"><h2>Barcha foydalanuvchilar</h2></h2>
        {loading ? (
          <div className="space-y-2 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="w-14 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2.5">
                  <Avatar username={u.username} size={7} />
                  <div>
                    <span className="text-[12.5px] font-medium text-white/70 group-hover:text-white transition-colors">{u.username}</span>
                    <span className="text-[11px] text-muted/40 ml-2">{u.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${roleColors[u.role] || roleColors.USER}`}>
                    {u.role}
                  </span>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => handleDisable(u.id)}
                      className="text-[11px] text-negative/50 hover:text-negative transition-colors flex items-center gap-1"
                    >
                      <Icon name="user_x" className="w-3 h-3" />
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
