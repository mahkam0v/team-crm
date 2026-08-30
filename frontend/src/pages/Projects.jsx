import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge.jsx';
import { AvatarStack } from '../components/AvatarStack.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { SkeletonTable } from '../components/Skeleton.jsx';

const sortOptions = [
  { value: 'newest', label: 'Yangi → eski' },
  { value: 'oldest', label: 'Eski → yangi' },
  { value: 'most_spent', label: "Ko'p sarflangan" },
  { value: 'least_spent', label: "Kam sarflangan" },
  { value: 'most_revenue', label: "Ko'p daromad" },
  { value: 'least_revenue', label: 'Kam daromad' },
  { value: 'most_profit', label: 'Eng katta foyda' },
  { value: 'least_profit', label: 'Eng kichik foyda' },
  { value: 'progress', label: "Progress bo\\'yicha" },
  { value: 'deadline', label: "Muddat bo\\'yicha" },
];

const statusFilters = [
  { value: '', label: 'Hammasi' },
  { value: 'PLANNING', label: 'Rejalashtirish' },
  { value: 'IN_PROGRESS', label: 'Faol' },
  { value: 'COMPLETED', label: 'Yakunlangan' },
  { value: 'ON_HOLD', label: 'Kutmoqda' },
  { value: 'CANCELLED', label: 'Bekor qilingan' },
];

export const Projects = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState('newest');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Loyihalar</h1>
          <p className="text-muted text-[13px] mt-0.5">{projects.length} ta loyiha mavjud</p>
        </div>
        <button onClick={() => navigate('/projects/new')} className="btn-primary group">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Yangi loyiha
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5 animate-fade-in stagger-1">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" />
          </svg>
          <input
            className="field mb-0 pl-9 max-w-xs"
            placeholder="Loyiha qidirish..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`text-[12px] px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                status === s.value
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select className="field mb-0 max-w-[180px] ml-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Hozircha loyiha mavjud emas"
          actionLabel="+ Yangi loyiha"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        <>
          {/* Table view */}
          <div className="card p-0 overflow-hidden mb-6 animate-fade-in stagger-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted border-b border-border">
                  <th className="px-4 py-3 font-medium">Loyiha nomi</th>
                  <th className="px-4 py-3 font-medium">Prioritet</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Jamoa</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Foyda</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-all duration-200 group"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="px-4 py-3 font-medium group-hover:text-accent transition-colors">{p.name}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><AvatarStack members={p.members} max={3} /></td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-ink rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="num text-[11px] text-muted w-8">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} small /></td>
                    <td className={`px-4 py-3 num font-medium ${p.finance.actualProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {p.finance.actualProfit >= 0 ? '+' : ''}{p.finance.actualProfit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card grid */}
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3 animate-fade-in stagger-3">Barcha loyihalar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
