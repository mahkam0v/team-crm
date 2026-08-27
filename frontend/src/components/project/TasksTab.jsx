import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusLabels = { TODO: 'Todo', IN_PROGRESS: 'Jarayonda', COMPLETED: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const priorityColors = { LOW: 'text-muted', MEDIUM: 'text-accent', HIGH: 'text-warning', URGENT: 'text-negative' };

const TaskComments = ({ taskId }) => {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');

  useEffect(() => {
    api.getTaskComments(taskId).then((r) => setComments(r.comments));
  }, [taskId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const { comment } = await api.addTaskComment(taskId, text);
    setComments((c) => [...c, comment]);
    setText('');
  };

  if (comments === null) return <p className="text-muted text-[12px] py-2">Yuklanmoqda...</p>;

  return (
    <div className="pl-3 border-l-2 border-border ml-1 mt-2 space-y-2">
      {comments.length === 0 && <p className="text-muted text-[12px]">Hali izoh yo'q</p>}
      {comments.map((c) => (
        <div key={c.id} className="text-[12.5px]">
          <span className="font-medium text-white">{c.authorUsername}</span>
          <span className="text-muted ml-2 text-[11px]">{new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
          <p className="text-muted mt-0.5">{c.message}</p>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <input
          className="field mb-0 py-1.5 text-[12.5px]"
          placeholder="Izoh yozing... (@username bilan mention qiling)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="btn-ghost text-accent shrink-0">Yuborish</button>
      </div>
    </div>
  );
};

export const TasksTab = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [expanded, setExpanded] = useState(null);

  const load = () => api.listTasks(projectId).then((r) => setTasks(r.tasks)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.createTask({ title, priority, projectId });
    setTitle('');
    load();
  };

  const handleStatusChange = async (id, status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.updateTask(id, { status });
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="card mb-4">
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2">
          <input className="field mb-0" placeholder="Yangi vazifa" value={title} onChange={(e) => setTitle(e.target.value)} />
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
        {loading ? (
          <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted text-sm py-6 text-center">Hali vazifa yo'q</p>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="py-3 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setExpanded((e) => (e === t.id ? null : t.id))}
                  className="flex items-center gap-2 min-w-0 text-left"
                >
                  <span className={`text-[10px] font-mono uppercase ${priorityColors[t.priority]}`}>{t.priority}</span>
                  <span className="text-[13.5px] truncate hover:text-accent">{t.title}</span>
                </button>
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
              {expanded === t.id && <TaskComments taskId={t.id} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
