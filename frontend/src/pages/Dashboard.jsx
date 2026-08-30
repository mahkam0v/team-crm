import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api.js';
import { StatCard } from '../components/StatCard.jsx';
import { SkeletonDashboard } from '../components/Skeleton.jsx';

const periods = [
  { value: 'today', label: 'Bugun' },
  { value: 'this_week', label: 'Bu hafta' },
  { value: 'this_month', label: 'Bu oy' },
  { value: 'last_month', label: "O'tgan oy" },
  { value: 'this_year', label: 'Bu yil' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-3 text-[12px] shadow-2xl">
      <div className="text-muted mb-1.5 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }} className="num flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {Number(p.value).toLocaleString()} so'm
        </div>
      ))}
    </div>
  );
};

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof value !== 'number') { setDisplay(value); return; }
    const start = display;
    const diff = value - start;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <>{typeof display === 'number' ? display.toLocaleString() : display}</>;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('this_month');
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.reportSummary(period), api.reportAnalytics()])
      .then(([s, a]) => { setSummary(s); setAnalytics(a); })
      .finally(() => setLoading(false));
  }, [period]);

  const pendingTotal = summary ? summary.pendingIncome + summary.pendingExpense : 0;
  const topProfit = analytics ? [...analytics.projectPerformance].sort((a, b) => b.profit - a.profit).slice(0, 4) : [];
  const topSpending = analytics ? [...analytics.projectPerformance].sort((a, b) => b.expense - a.expense).slice(0, 4) : [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight animate-fade-in">Dashboard</h1>
          <p className="text-muted text-[13px] mt-0.5 animate-fade-in stagger-1">Bugungi holat — {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 animate-fade-in stagger-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-[12.5px] px-3 py-1.5 rounded-lg transition-all duration-200 ${
                period === p.value
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !summary ? (
        <SkeletonDashboard />
      ) : (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 animate-fade-in stagger-1">
            {[
              { label: '+ Loyiha', action: () => navigate('/projects/new'), color: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20' },
              { label: '+ Vazifa', action: () => navigate('/tasks'), color: 'bg-positive/10 text-positive border-positive/20 hover:bg-positive/20' },
              { label: '+ Tranzaksiya', action: () => navigate('/finance'), color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`text-[12.5px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${item.color}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Financial KPIs */}
          <div className="animate-fade-in stagger-2">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              Moliya
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Daromad" value={summary.income} tone="positive" onClick={() => navigate('/finance')} />
              <StatCard label="Xarajat" value={summary.expense} tone="negative" onClick={() => navigate('/finance')} />
              <StatCard label="Foyda" value={summary.profit} tone={summary.profit >= 0 ? 'positive' : 'negative'} onClick={() => navigate('/finance')} />
            </div>
          </div>

          {/* Operational KPIs */}
          <div className="animate-fade-in stagger-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Faoliyat
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Yaratilgan loyihalar" value={summary.projectsCreated} suffix="" onClick={() => navigate('/projects')} />
              <StatCard label="Tugallangan loyihalar" value={summary.projectsCompleted} suffix="" onClick={() => navigate('/projects?status=COMPLETED')} />
              <StatCard label="Bajarilgan vazifalar" value={summary.tasksCompleted} suffix="" onClick={() => navigate('/tasks')} />
              <StatCard
                label="Kutilayotgan to'lovlar"
                value={pendingTotal}
                tone="warning"
                hint="Bosing — Moliyada bajarilgan/bekor qilish mumkin"
                onClick={() => navigate('/finance')}
              />
            </div>
          </div>

          {/* Financial trend chart */}
          {analytics?.monthlyTrend && (
            <div className="card glow-accent animate-fade-in stagger-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Daromad vs Xarajat — so'nggi 6 oy
                </h2>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-positive" /> Daromad</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-negative" /> Xarajat</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.monthlyTrend}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E3344" vertical={false} />
                  <XAxis dataKey="label" stroke="#8A8FA3" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8A8FA3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="income" name="Daromad" stroke="#34D399" fill="url(#incomeGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#12141C' }} />
                  <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#F87171" fill="url(#expenseGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#12141C' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Project performance + task stats */}
          <div className="grid lg:grid-cols-3 gap-4 animate-fade-in stagger-5">
            {/* Top profitable */}
            <div className="card hover:shadow-lg hover:shadow-positive/5 transition-all duration-300">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                Eng foydali loyihalar
              </h2>
              {topProfit.length === 0 ? (
                <p className="text-muted text-[12.5px] py-4 text-center">Ma'lumot yo'q</p>
              ) : (
                <div className="space-y-0.5">
                  {topProfit.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="w-full flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-muted w-4">{i + 1}</span>
                        <span className="text-[13px] truncate group-hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <span className={`num text-[12.5px] shrink-0 ml-2 ${p.profit >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {p.profit >= 0 ? '+' : ''}{p.profit.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top spending */}
            <div className="card hover:shadow-lg hover:shadow-negative/5 transition-all duration-300">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-negative" />
                Eng ko'p sarflangan
              </h2>
              {topSpending.length === 0 ? (
                <p className="text-muted text-[12.5px] py-4 text-center">Ma'lumot yo'q</p>
              ) : (
                <div className="space-y-0.5">
                  {topSpending.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="w-full flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-muted w-4">{i + 1}</span>
                        <span className="text-[13px] truncate group-hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <span className="num text-[12.5px] text-negative shrink-0 ml-2">
                        -{p.expense.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task stats with better bars */}
            <div className="card hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Vazifalar holati
              </h2>
              {analytics?.taskStats && (
                <div className="space-y-4">
                  {[
                    { label: 'Bajarilgan', value: analytics.taskStats.completed, color: 'bg-positive', glow: 'shadow-positive/30' },
                    { label: 'Jarayonda', value: analytics.taskStats.inProgress, color: 'bg-accent', glow: 'shadow-accent/30' },
                    { label: 'Todo', value: analytics.taskStats.todo, color: 'bg-muted', glow: '' },
                    { label: "Muddati o'tgan", value: analytics.taskStats.overdue, color: 'bg-negative', glow: 'shadow-negative/30' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-muted">{s.label}</span>
                        <span className="num font-semibold">{s.value}</span>
                      </div>
                      <div className="w-full h-2 bg-ink rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full transition-all duration-700 ease-out`}
                          style={{
                            width: `${Math.min(100, s.value * 10)}%`,
                            boxShadow: s.value > 0 ? `0 0 8px ${s.glow}` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
