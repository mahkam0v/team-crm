import { useEffect, useState } from 'react';
import { api } from '../api.js';

const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusLabels = { TODO: 'Todo', IN_PROGRESS: 'Jarayonda', COMPLETED: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const priorityColors = { LOW: 'text-muted', MEDIUM: 'text-accent', HIGH: 'text-warning', URGENT: 'text-negative' };

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');

  const load = () => api.listTasks().then((r) => setTasks(r.tasks)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return;
    try {
      await api.createTask({ title, priority });
      setTitle('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.updateTask(id, { status });
  };

  return (
    <div>
      <h1 className="font-display text-xl font-semibold tracking-tight mb-6">Vazifalar</h1>

      <form onSubmit={handleCreate} className="card mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-3">Yangi vazifa</h2>
        {error && <p className="text-negative text-[12.5px] mb-2">{error}</p>}
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2">
          <input className="field mb-0" placeholder="Vazifa nomi" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="field mb-0" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Past</option>
            <option value="MEDIUM">O'rtacha</option>
            <option value="HIGH">Yuqori</option>
            <option value="URGENT">Shoshilinch</option>
          </select>
          <button className="btn-primary">Qo'shish</button>
        </div>
      </form>

      <div className="card">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-1">Barcha vazifalar</h2>
        {loading ? (
          <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted text-sm py-6 text-center">Hali vazifa yo'q</p>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-mono uppercase ${priorityColors[t.priority]}`}>{t.priority}</span>
                <span className="text-[13.5px] truncate">{t.title}</span>
              </div>
              <select
                value={t.status}
                onChange={(e) => handleStatusChange(t.id, e.target.value)}
                className="field mb-0 w-[150px] py-1.5 text-[12.5px]"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
