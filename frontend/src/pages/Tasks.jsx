import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Skeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/Icon.jsx';
import toast from 'react-hot-toast';

const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusLabels = { TODO: 'Todo', IN_PROGRESS: 'Jarayonda', COMPLETED: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const statusIcons = { TODO: 'clipboard', IN_PROGRESS: 'zap', COMPLETED: 'check_circle', CANCELLED: 'x_circle' };
const statusColors = {
  TODO: 'text-muted',
  IN_PROGRESS: 'text-accent',
  COMPLETED: 'text-positive',
  CANCELLED: 'text-negative',
};
const statusBg = {
  TODO: 'bg-white/[0.04]',
  IN_PROGRESS: 'bg-accent/8',
  COMPLETED: 'bg-positive/8',
  CANCELLED: 'bg-negative/8',
};
const priorityConfig = {
  LOW: { color: 'text-muted/60', bg: 'bg-white/[0.04]', icon: 'arrow_down', label: 'Past' },
  MEDIUM: { color: 'text-accent', bg: 'bg-accent/8', icon: 'arrow_right', label: "O'rtacha" },
  HIGH: { color: 'text-warning', bg: 'bg-warning/8', icon: 'arrow_up', label: 'Yuqori' },
  URGENT: { color: 'text-rose', bg: 'bg-rose/8', icon: 'zap', label: 'Shoshilinch' },
};

const priorityOptions = [
  { value: 'LOW', label: 'Past' },
  { value: 'MEDIUM', label: "O'rtacha" },
  { value: 'HIGH', label: 'Yuqori' },
  { value: 'URGENT', label: 'Shoshilinch' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);

  const load = () => api.listTasks().then((r) => setTasks(r.tasks)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Vazifa nomini kiriting');
    try {
      await api.createTask({ title, priority });
      setTitle('');
      setPriority('MEDIUM');
      load();
      toast.success('Vazifa yaratildi!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    const prev = tasks.find((t) => t.id === id)?.status;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await api.updateTask(id, { status });
      toast.success(`Status o'zgartirildi: ${statusLabels[status]}`);
    } catch (err) {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: prev } : t)));
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks((ts) => ts.filter((t) => t.id !== id));
      toast.success('Vazifa o\'chirildi');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTask) {
      handleStatusChange(draggedTask, status);
      setDraggedTask(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
  };

  const completionRate = tasks.length > 0 ? Math.round((taskStats.completed / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight animate-fade-in">
            <span className="gradient-text">Vazifalar</span>
          </h1>
          <p className="text-muted/60 text-[12.5px] mt-0.5 animate-fade-in stagger-1">
            {tasks.length} ta vazifa · {completionRate}% bajarildi
          </p>
        </div>
        <div className="segment animate-fade-in stagger-2">
          <button
            onClick={() => setView('kanban')}
            className={`segment-btn flex items-center gap-1.5 ${view === 'kanban' ? 'active' : ''}`}
          >
            <Icon name="grid" className="w-3 h-3" />
            Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`segment-btn flex items-center gap-1.5 ${view === 'list' ? 'active' : ''}`}
          >
            <Icon name="list" className="w-3 h-3" />
            Ro'yxat
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && tasks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-fade-in stagger-1">
          {[
            { label: 'Jami', value: taskStats.total, icon: 'clipboard', color: 'text-white' },
            { label: 'Bajarilgan', value: taskStats.completed, icon: 'check_circle', color: 'text-positive' },
            { label: 'Jarayonda', value: taskStats.inProgress, icon: 'zap', color: 'text-accent' },
            { label: 'Todo', value: taskStats.todo, icon: 'file_text', color: 'text-muted' },
          ].map((s) => (
            <div key={s.label} className="card py-3 px-4 text-center group hover:border-white/[0.08] transition-all duration-200">
              <Icon name={s.icon} className={`w-4 h-4 mx-auto mb-1.5 ${s.color} opacity-50`} />
              <div className={`num text-[20px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10.5px] text-muted/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in stagger-2">
        <div className="relative flex-1 max-w-xs">
          <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/40" />
          <input
            className="field mb-0 pl-8 text-[12.5px]"
            placeholder="Vazifa qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-0.5 bg-white/[0.03] border border-white/[0.05] rounded-lg p-0.5 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterPriority('')}
            className={`segment-btn text-[11px] whitespace-nowrap ${!filterPriority ? 'active' : ''}`}
          >
            Hammasi
          </button>
          {Object.entries(priorityConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterPriority(key === filterPriority ? '' : key)}
              className={`segment-btn text-[11px] flex items-center gap-1 whitespace-nowrap ${filterPriority === key ? 'active' : ''}`}
            >
              <Icon name={cfg.icon} className="w-2.5 h-2.5" strokeWidth={2.5} />
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="card mb-5 animate-fade-in stagger-3">
        <h2 className="section-heading"><h2>Yangi vazifa</h2></h2>
        {error && (
          <div className="bg-negative/8 border border-negative/15 text-negative text-[12px] rounded-lg px-3 py-2 mb-3 animate-fade-in">
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
            {priorityOptions.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button className="btn-primary">
            <span className="flex items-center gap-1.5">
              <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
              Qo'shish
            </span>
          </button>
        </div>
      </form>

      {/* Kanban View */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in stagger-4">
          {statuses.map((status) => {
            const statusTasks = filteredTasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <div className="flex items-center gap-1.5">
                    <Icon name={statusIcons[status]} className={`w-3.5 h-3.5 ${statusColors[status]}`} strokeWidth={2} />
                    <span className="text-[12px] font-semibold text-white/70">{statusLabels[status]}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted/40 bg-white/[0.03] px-1.5 py-0.5 rounded">
                    {statusTasks.length}
                  </span>
                </div>
                {statusTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-[11px] text-muted/25 border border-dashed border-white/[0.06] rounded-lg">
                    Bo'sh
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {statusTasks.map((t) => {
                      const config = priorityConfig[t.priority] || priorityConfig.MEDIUM;
                      return (
                        <div
                          key={t.id}
                          className={`kanban-card ${draggedTask === t.id ? 'dragging' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color} flex items-center gap-1`}>
                              <Icon name={config.icon} className="w-2 h-2" strokeWidth={2.5} />
                              {t.priority}
                            </span>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="text-muted/20 hover:text-negative transition-colors p-0.5 rounded hover:bg-negative/10 opacity-0 group-hover:opacity-100"
                            >
                              <Icon name="x" className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[12.5px] text-white/80 leading-snug">{t.title}</p>
                          <div className="mt-2 pt-2 border-t border-white/[0.04]">
                            <select
                              value={t.status}
                              onChange={(e) => handleStatusChange(t.id, e.target.value)}
                              className="w-full text-[10.5px] bg-white/[0.03] border border-white/[0.04] text-muted/60 rounded-md px-2 py-1 focus:outline-none focus:border-accent/30 transition-colors"
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>{statusLabels[s]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card animate-fade-in stagger-4">
          <h2 className="section-heading"><h2>Barcha vazifalar</h2></h2>
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-16 h-5" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="w-28 h-7" />
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <p className="text-muted/40 text-[12.5px] py-10 text-center">Vazifa topilmadi</p>
          ) : (
            <div className="space-y-0">
              {filteredTasks.map((t) => {
                const config = priorityConfig[t.priority] || priorityConfig.MEDIUM;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 gap-3 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-[9.5px] font-medium uppercase px-1.5 py-0.5 rounded ${config.bg} ${config.color} flex items-center gap-1 shrink-0`}>
                        <Icon name={config.icon} className="w-2 h-2" strokeWidth={2.5} />
                        {t.priority}
                      </span>
                      <span className="text-[12.5px] truncate text-white/70 group-hover:text-white transition-colors">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="field mb-0 w-[130px] py-1 text-[11.5px]"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-muted/20 hover:text-negative transition-colors p-1 rounded hover:bg-negative/8"
                      >
                        <Icon name="trash" className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
