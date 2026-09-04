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
import { Icon } from '../components/Icon.jsx';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'eye' },
  { key: 'tasks', label: 'Vazifalar', icon: 'tasks' },
  { key: 'finance', label: 'Moliya', icon: 'finance' },
  { key: 'calendar', label: 'Kalendar', icon: 'calendar' },
  { key: 'files', label: 'Fayllar', icon: 'file' },
  { key: 'notes', label: 'Eslatmalar', icon: 'file_text' },
  { key: 'chat', label: 'Chat', icon: 'message_square' },
  { key: 'members', label: "A'zolar", icon: 'users' },
  { key: 'activity', label: 'Faoliyat', icon: 'activity' },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [unreadChat, setUnreadChat] = useState(0);

  const loadProject = () => api.getProject(id).then((r) => setProject(r.project)).finally(() => setLoading(false));
  useEffect(() => { loadProject(); }, [id]);

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
    try {
      await api.deleteProject(id);
      toast.success('Loyiha o\'chirildi');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message || 'O\'chirishda xatolik');
    }
  };

  if (loading) return <p className="text-muted/50 text-[13px]">Yuklanmoqda...</p>;
  if (!project) return <p className="text-negative text-[13px]">Loyiha topilmadi</p>;

  const canManage = project.ownerId === currentUser.id || ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  return (
    <div>
      <div className="mb-2">
        <Link to="/projects" className="text-[12px] text-muted/40 hover:text-white/70 flex items-center gap-1 transition-colors">
          <Icon name="arrow_left" className="w-3 h-3" />
          Loyihalar
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h1 className="font-display text-xl font-semibold tracking-tight min-w-0 break-words">{project.name}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={project.status} />
          {canManage && (
            <button onClick={handleDelete} className="btn-danger text-[11px] py-1 px-2 flex items-center gap-1">
              <Icon name="trash" className="w-3 h-3" />
              O'chirish
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <PriorityBadge priority={project.priority} />
        {project.client && <span className="text-[11.5px] text-muted/40">Mijoz: {project.client}</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-white/[0.04] mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => (t.key === 'chat' ? handleOpenChat() : setTab(t.key))}
            className={`relative flex items-center gap-1.5 text-[12px] font-medium px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-accent text-white' : 'border-transparent text-muted/50 hover:text-white/70'
            }`}
          >
            <Icon name={t.icon} className="w-3.5 h-3.5" strokeWidth={1.8} />
            {t.label}
            {t.key === 'chat' && unreadChat > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center text-[9px] w-3.5 h-3.5 rounded-full bg-negative text-white">
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

export default ProjectDetail;
