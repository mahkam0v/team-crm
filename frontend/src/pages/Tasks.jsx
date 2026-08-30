import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Skeleton } from '../components/Skeleton.jsx';

const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusLabels = { TODO: 'Todo', IN_PROGRESS: 'Jarayonda', COMPLETED: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const statusColors = {
  TODO: 'bg-muted/15 text-muted',
  IN_PROGRESS: 'bg-accent/15 text-accent',
  COMPLETED: 'bg-positive/15 text-positive',
  CANCELLED: 'bg-negative/15 text-negative',
};
const priorityConfig = {
  LOW: { color: 'text-muted', bg: 'bg-muted/10', icon: '↓' },
  MEDIUM: { color: 'text-accent', bg: 'bg-accent/10', icon: '→' },
  HIGH: { color: 'text-warning', bg: 'bg-warning/10', icon: '↑' },
  URGENT: { color: 'text-negative', bg: 'bg-negative/10', icon: '⚡' },
};

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

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold tracking-tight">Vazifalar</h1>
        <p className="text-muted text-[13px] mt-0.5">{tasks.length} ta vazifa mavjud</p>
      </div>

      {/* Stats */}
      {!loading && tasks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-fade-in stagger-1">
          {[
            { label: 'Jami', value: taskStats.total, color: 'text-white' },
            { label: 'Bajarilgan', value: taskStats.completed, color: 'text-positive' },
            { label: 'Jarayonda', value: taskStats.inProgress, color: 'text-accent' },
            { label: 'Todo', value: taskStats.todo, color: 'text-muted' },
          ].map((s) => (
            <div key={s.label} className="card py-3 px-4 text-center">
              <div className={`num text-[20px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="card mb-5 animate-fade-in stagger-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-3">Yangi vazifa</h2>
        {error && (
          <div className="bg-negative/10 border border-negative/20 text-negative text-[12.5px] rounded-lg px-3 py-2 mb-3 animate-fade-in">
            {error}
          </div>
        )}
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2">
          <input
            className="field mb-0"
            placeholder="Vazifa nomi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select className="field mb-0" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Past</option>
            <option value="MEDIUM">O'rtacha</option>
            <option value="HIGH">Yuqori</option>
            <option value="URGENT">Shoshilinch</option>
          </select>
          <button className="btn-primary">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Qo'shish
            </span>
          </button>
        </div>
      </form>

      {/* Tasks list */}
      <div className="card animate-fade-in stagger-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-1">Barcha vazifalar</h2>
        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-5" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="w-[150px] h-8" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-muted text-sm py-8 text-center">Hali vazifa yo'q</p>
        ) : (
          <div className="space-y-0.5">
            {tasks.map((t, i) => {
              const config = priorityConfig[t.priority] || priorityConfig.MEDIUM;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 gap-3 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${config.bg} ${config.color} flex items-center gap-1`}>
                      <span>{config.icon}</span>
                      {t.priority}
                    </span>
                    <span className="text-[13.5px] truncate group-hover:text-white transition-colors">{t.title}</span>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    className={`field mb-0 w-[150px] py-1.5 text-[12.5px] ${statusColors[t.status]}`}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
