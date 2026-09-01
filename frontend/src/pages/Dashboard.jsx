import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api.js';
import { StatCard } from '../components/StatCard.jsx';
import { SkeletonDashboard } from '../components/Skeleton.jsx';
import { Icon } from '../components/Icon.jsx';

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
    <div className="glass border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[11.5px] shadow-elevated">
      <div className="text-muted/60 mb-1 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }} className="num flex items-center gap-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {Number(p.value).toLocaleString()} so'm
        </div>
      ))}
    </div>
  );
};

const AnimatedNumber = ({ value, duration = 800 }) => {
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
  const topProfit = analytics ? [...analytics.projectPerformance].sort((a, b) => b.profit - a.profit).slice(0, 5) : [];
  const topSpending = analytics ? [...analytics.projectPerformance].sort((a, b) => b.expense - a.expense).slice(0, 5) : [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight animate-fade-in">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted/60 text-[12.5px] mt-0.5 animate-fade-in stagger-1">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="segment animate-fade-in stagger-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`segment-btn ${period === p.value ? 'active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !summary ? (
        <SkeletonDashboard />
      ) : (
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 animate-fade-in stagger-1">
            {[
              { label: 'Yangi loyiha', icon: 'plus', action: () => navigate('/projects/new'), color: 'text-accent border-accent/15 hover:bg-accent/5' },
              { label: 'Yangi vazifa', icon: 'plus', action: () => navigate('/tasks'), color: 'text-teal border-teal/15 hover:bg-teal/5' },
              { label: 'Tranzaksiya', icon: 'plus', action: () => navigate('/finance'), color: 'text-warning border-warning/15 hover:bg-warning/5' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 hover:-translate-y-0.5 ${item.color}`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon name={item.icon} className="w-3 h-3" strokeWidth={2.5} />
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Financial KPIs */}
          <div className="animate-fade-in stagger-2">
            <div className="section-heading">
              <h2>Moliya</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="Daromad" value={summary.income} tone="positive" onClick={() => navigate('/finance')} />
              <StatCard label="Xarajat" value={summary.expense} tone="negative" onClick={() => navigate('/finance')} />
              <StatCard label="Foyda" value={summary.profit} tone={summary.profit >= 0 ? 'positive' : 'negative'} onClick={() => navigate('/finance')} />
            </div>
          </div>

          {/* Operational KPIs */}
          <div className="animate-fade-in stagger-3">
            <div className="section-heading">
              <h2>Faoliyat</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Yaratilgan loyihalar" value={summary.projectsCreated} suffix="" onClick={() => navigate('/projects')} hint="Barcha loyihalar" />
              <StatCard label="Tugallangan loyihalar" value={summary.projectsCompleted} suffix="" onClick={() => navigate('/projects?status=COMPLETED')} hint="COMPLETED status" />
              <StatCard label="Bajarilgan vazifalar" value={summary.tasksCompleted} suffix="" onClick={() => navigate('/tasks')} hint="COMPLETED vazifalar" />
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
            <div className="card animate-fade-in stagger-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="section-heading">
                  <h2>Daromad vs Xarajat — so'nggi 6 oy</h2>
                </div>
                <div className="flex items-center gap-4 text-[10.5px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-positive" />
                    Daromad
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-negative" />
                    Xarajat
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.monthlyTrend}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,34,51,0.6)" vertical={false} />
                  <XAxis dataKey="label" stroke="#5c6078" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5c6078" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="income" name="Daromad" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#08090d', stroke: '#22c55e' }} />
                  <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#08090d', stroke: '#ef4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Project performance + task stats */}
          <div className="grid lg:grid-cols-3 gap-4 animate-fade-in stagger-5">
            {/* Top profitable */}
            <div className="card group">
              <div className="section-heading">
                <h2>Eng foydali loyihalar</h2>
              </div>
              {topProfit.length === 0 ? (
                <p className="text-muted/40 text-[12px] py-6 text-center">Ma'lumot yo'q</p>
              ) : (
                <div className="space-y-0">
                  {topProfit.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="w-full flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-muted/30 w-4 text-center">{i + 1}</span>
                        <span className="text-[12.5px] truncate text-white/70 hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <span className={`num text-[12px] shrink-0 ml-2 font-medium ${p.profit >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {p.profit >= 0 ? '+' : ''}{p.profit.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top spending */}
            <div className="card group">
              <div className="section-heading">
                <h2>Eng ko'p sarflangan</h2>
              </div>
              {topSpending.length === 0 ? (
                <p className="text-muted/40 text-[12px] py-6 text-center">Ma'lumot yo'q</p>
              ) : (
                <div className="space-y-0">
                  {topSpending.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="w-full flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-muted/30 w-4 text-center">{i + 1}</span>
                        <span className="text-[12.5px] truncate text-white/70 hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <span className="num text-[12px] text-negative shrink-0 ml-2 font-medium">
                        -{p.expense.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task stats */}
            <div className="card group">
              <div className="section-heading">
                <h2>Vazifalar holati</h2>
              </div>
              {analytics?.taskStats && (
                <div className="space-y-3.5">
                  {[
                    { label: 'Bajarilgan', value: analytics.taskStats.completed, color: 'bg-positive', total: analytics.taskStats.completed + analytics.taskStats.inProgress + analytics.taskStats.todo + analytics.taskStats.overdue },
                    { label: 'Jarayonda', value: analytics.taskStats.inProgress, color: 'bg-accent', total: 0 },
                    { label: 'Todo', value: analytics.taskStats.todo, color: 'bg-white/20', total: 0 },
                    { label: "Muddati o'tgan", value: analytics.taskStats.overdue, color: 'bg-negative', total: 0 },
                  ].map((s, i) => {
                    const total = analytics.taskStats.completed + analytics.taskStats.inProgress + analytics.taskStats.todo + analytics.taskStats.overdue;
                    return (
                      <div key={s.label}>
                        <div className="flex justify-between text-[11.5px] mb-1">
                          <span className="text-muted/60">{s.label}</span>
                          <span className="num font-semibold text-white/80">{s.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.color} rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
