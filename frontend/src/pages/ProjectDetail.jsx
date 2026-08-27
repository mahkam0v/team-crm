import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge.jsx';
import { OverviewTab } from '../components/project/OverviewTab.jsx';
import { TasksTab } from '../components/project/TasksTab.jsx';
import { FinanceTab } from '../components/project/FinanceTab.jsx';
import { CalendarTab } from '../components/project/CalendarTab.jsx';
import { FilesTab } from '../components/project/FilesTab.jsx';
import { NotesTab } from '../components/project/NotesTab.jsx';
import { ChatTab } from '../components/project/ChatTab.jsx';
import { MembersTab } from '../components/project/MembersTab.jsx';
import { ActivityTab } from '../components/project/ActivityTab.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'Vazifalar' },
  { key: 'finance', label: 'Moliya' },
  { key: 'calendar', label: 'Kalendar' },
  { key: 'files', label: 'Fayllar' },
  { key: 'notes', label: 'Eslatmalar' },
  { key: 'chat', label: 'Chat' },
  { key: 'members', label: "A'zolar" },
  { key: 'activity', label: 'Faoliyat' },
];

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [unreadChat, setUnreadChat] = useState(0);

  const loadProject = () => api.getProject(id).then((r) => setProject(r.project)).finally(() => setLoading(false));
  useEffect(() => { loadProject(); }, [id]);

  // lightweight "unread" indicator: compare chat length against last-seen count stored locally
  useEffect(() => {
    api.getProjectChat(id).then((r) => {
      const seenKey = `chat-seen-${id}`;
      const seen = Number(localStorage.getItem(seenKey) || 0);
      setUnreadChat(Math.max(0, r.messages.length - seen));
    }).catch(() => {});
  }, [id]);

  const handleOpenChat = () => {
    setTab('chat');
    setUnreadChat(0);
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${project.name}" loyihasini butunlay o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`)) return;
    await api.deleteProject(id);
    navigate('/projects');
  };

  if (loading) return <p className="text-muted text-sm">Yuklanmoqda...</p>;
  if (!project) return <p className="text-negative text-sm">Loyiha topilmadi</p>;

  const canManage = project.ownerId === currentUser.id || ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  return (
    <div>
      <div className="mb-1">
        <Link to="/projects" className="text-[12.5px] text-muted hover:text-white">&larr; Loyihalar</Link>
      </div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-xl font-semibold tracking-tight">{project.name}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          {canManage && (
            <button onClick={handleDelete} className="text-[11.5px] text-negative hover:underline ml-2">
              O'chirish
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-5">
        <PriorityBadge priority={project.priority} />
        {project.client && <span className="text-[12px] text-muted">Mijoz: {project.client}</span>}
      </div>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => (t.key === 'chat' ? handleOpenChat() : setTab(t.key))}
            className={`relative text-[13px] font-medium px-3.5 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-accent text-white' : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {t.label}
            {t.key === 'chat' && unreadChat > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center text-[10px] w-4 h-4 rounded-full bg-negative text-white align-middle">
                {unreadChat}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab project={project} />}
      {tab === 'tasks' && <TasksTab projectId={id} />}
      {tab === 'finance' && <FinanceTab projectId={id} onChanged={loadProject} />}
      {tab === 'calendar' && <CalendarTab project={project} projectId={id} />}
      {tab === 'files' && <FilesTab entityType="PROJECT" entityId={id} />}
      {tab === 'notes' && <NotesTab projectId={id} />}
      {tab === 'chat' && <ChatTab projectId={id} />}
      {tab === 'members' && <MembersTab projectId={id} project={project} onChanged={loadProject} />}
      {tab === 'activity' && <ActivityTab projectId={id} />}
    </div>
  );
};
