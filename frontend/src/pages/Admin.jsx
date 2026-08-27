import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

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
      <h1 className="font-display text-xl font-semibold tracking-tight mb-6">Admin — Foydalanuvchilar</h1>

      <form onSubmit={handleCreate} className="card mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-3">Yangi user</h2>
        {error && <p className="text-negative text-[12.5px] mb-2">{error}</p>}
        <div className="grid sm:grid-cols-5 gap-2">
          <input className="field mb-0" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="field mb-0" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field mb-0" type="password" placeholder="Parol" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="field mb-0" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="USER">User</option>
            {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
          </select>
          <button className="btn-primary">Yaratish</button>
        </div>
      </form>

      <div className="card">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-1">Barcha foydalanuvchilar</h2>
        {loading ? (
          <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <span className="text-[13.5px] font-medium">{u.username}</span>
                <span className="text-[12px] text-muted ml-2">{u.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono uppercase text-accent">{u.role}</span>
                {u.id !== currentUser.id && (
                  <button onClick={() => handleDisable(u.id)} className="text-[12px] text-negative hover:underline">
                    Bloklash
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
