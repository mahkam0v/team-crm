import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge.jsx';
import { AvatarStack } from '../components/AvatarStack.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { SkeletonTable } from '../components/Skeleton.jsx';
import { Icon } from '../components/Icon.jsx';

const sortOptions = [
  { value: 'newest', label: 'Yangi → eski' },
  { value: 'oldest', label: 'Eski → yangi' },
  { value: 'most_spent', label: "Ko'p sarflangan" },
  { value: 'least_spent', label: "Kam sarflangan" },
  { value: 'most_revenue', label: "Ko'p daromad" },
  { value: 'least_revenue', label: 'Kam daromad' },
  { value: 'most_profit', label: 'Eng katta foyda' },
  { value: 'least_profit', label: 'Eng kichik foyda' },
  { value: 'progress', label: "Progress bo'yicha" },
  { value: 'deadline', label: "Muddat bo'yicha" },
];

const statusFilters = [
  { value: '', label: 'Hammasi', icon: 'folder' },
  { value: 'PLANNING', label: 'Rejalashtirish', icon: 'file_text' },
  { value: 'IN_PROGRESS', label: 'Faol', icon: 'zap' },
  { value: 'COMPLETED', label: 'Yakunlangan', icon: 'check_circle' },
  { value: 'ON_HOLD', label: 'Kutmoqda', icon: 'clock' },
  { value: 'CANCELLED', label: 'Bekor qilingan', icon: 'x_circle' },
];

const Projects = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');

  const load = () => {
    setLoading(true);
    const params = { sort };
    if (status) params.status = status;
    if (q) params.q = q;
    api.listProjects(params).then((r) => setProjects(r.projects)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, sort]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight animate-fade-in">
            <span className="gradient-text">Loyihalar</span>
          </h1>
          <p className="text-muted/60 text-[12.5px] mt-0.5 animate-fade-in stagger-1">{projects.length} ta loyiha mavjud</p>
        </div>
        <div className="flex items-center gap-2 animate-fade-in stagger-2">
          <div className="segment">
            <button
              onClick={() => setView('grid')}
              className={`segment-btn flex items-center gap-1.5 ${view === 'grid' ? 'active' : ''}`}
            >
              <Icon name="grid" className="w-3 h-3" />
              Kartalar
            </button>
            <button
              onClick={() => setView('table')}
              className={`segment-btn flex items-center gap-1.5 ${view === 'table' ? 'active' : ''}`}
            >
              <Icon name="list" className="w-3 h-3" />
              Jadval
            </button>
          </div>
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            <span className="flex items-center gap-1.5">
              <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
              Yangi loyiha
            </span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in stagger-2">
        <div className="relative flex-1 max-w-xs">
          <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/40" />
          <input
            className="field mb-0 pl-8 text-[12.5px]"
            placeholder="Loyiha qidirish..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-0.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-0.5 overflow-x-auto">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`segment-btn text-[11px] whitespace-nowrap flex items-center gap-1 ${status === s.value ? 'active' : ''}`}
            >
              <Icon name={s.icon} className="w-3 h-3" strokeWidth={1.8} />
              {s.label}
            </button>
          ))}
        </div>
        <select className="field mb-0 max-w-[160px] ml-auto text-[12px]" value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon="folder"
          title="Hozircha loyiha mavjud emas"
          actionLabel="Yangi loyiha yaratish"
          onAction={() => navigate('/projects/new')}
        />
      ) : view === 'table' ? (
        /* Table View */
        <div className="card p-0 overflow-hidden animate-fade-in stagger-3">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted/40 border-b border-white/[0.04]">
                <th className="px-4 py-2.5 font-medium">Loyiha nomi</th>
                <th className="px-4 py-2.5 font-medium">Prioritet</th>
                <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Jamoa</th>
                <th className="px-4 py-2.5 font-medium">Progress</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Foyda</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 font-medium group-hover:text-accent transition-colors">{p.name}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><AvatarStack members={p.members} max={3} /></td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="num text-[10.5px] text-muted/50 w-7">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} small /></td>
                  <td className={`px-4 py-3 num font-semibold text-[12px] ${p.finance.actualProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {p.finance.actualProfit >= 0 ? '+' : ''}{p.finance.actualProfit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-fade-in stagger-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
