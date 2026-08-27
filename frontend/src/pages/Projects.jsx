import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge.jsx';
import { AvatarStack } from '../components/AvatarStack.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

const sortOptions = [
  { value: 'newest', label: 'Yangi → eski' },
  { value: 'oldest', label: 'Eski → yangi' },
  { value: 'most_spent', label: "Ko'p sarflangan" },
  { value: 'least_spent', label: "Kam sarflangan" },
  { value: 'most_revenue', label: "Ko'p daromad" },
  { value: 'least_revenue', label: 'Kam daromad' },
  { value: 'most_profit', label: 'Eng katta foyda' },
  { value: 'least_profit', label: 'Eng kichik foyda' },
  { value: 'progress', label: 'Progress bo\'yicha' },
  { value: 'deadline', label: 'Muddat bo\'yicha' },
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-xl font-semibold tracking-tight">Loyihalar</h1>
        <button onClick={() => navigate('/projects/new')} className="btn-primary">+ Yangi loyiha</button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <input
          className="field mb-0 max-w-xs"
          placeholder="Loyiha qidirish..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-1 bg-surface border border-border rounded p-1">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`text-[12px] px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
                status === s.value ? 'bg-accent text-white' : 'text-muted hover:text-white'
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
        <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Hozircha loyiha mavjud emas"
          actionLabel="+ Yangi loyiha"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        <>
          {/* Table view — dense overview */}
          <div className="card p-0 overflow-hidden mb-6">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted border-b border-border">
                  <th className="px-4 py-3 font-medium">Loyiha nomi</th>
                  <th className="px-4 py-3 font-medium">Prioritet</th>
                  <th className="px-4 py-3 font-medium">Jamoa</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Foyda</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="border-b border-border last:border-0 hover:bg-raised cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                    <td className="px-4 py-3"><AvatarStack members={p.members} max={3} /></td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-ink rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="num text-[11px] text-muted w-8">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} small /></td>
                    <td className={`px-4 py-3 num ${p.finance.actualProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {p.finance.actualProfit >= 0 ? '+' : ''}{p.finance.actualProfit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card grid — highlighted view */}
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Muhim loyihalar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
