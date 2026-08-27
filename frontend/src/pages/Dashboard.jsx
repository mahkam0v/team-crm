import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api.js';
import { StatCard } from '../components/StatCard.jsx';

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
    <div className="bg-raised border border-border rounded px-3 py-2 text-[12px]">
      <div className="text-muted mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }} className="num">
          {p.name}: {Number(p.value).toLocaleString()} so'm
        </div>
      ))}
    </div>
  );
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex gap-1 bg-surface border border-border rounded p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-[12.5px] px-3 py-1.5 rounded transition-colors ${
                period === p.value ? 'bg-accent text-white' : 'text-muted hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !summary ? (
        <p className="text-muted text-sm">Yuklanmoqda...</p>
      ) : (
        <div className="space-y-6">
          {/* Financial KPIs */}
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-2">Moliya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Daromad" value={summary.income} tone="positive" onClick={() => navigate('/finance')} />
              <StatCard label="Xarajat" value={summary.expense} tone="negative" onClick={() => navigate('/finance')} />
              <StatCard label="Foyda" value={summary.profit} tone={summary.profit >= 0 ? 'positive' : 'negative'} onClick={() => navigate('/finance')} />
            </div>
          </div>

          {/* Operational KPIs */}
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-2">Faoliyat</h2>
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
            <div className="card">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-4">
                Daromad vs Xarajat — so'nggi 6 oy
              </h2>
              <ResponsiveContainer width="100%" height={220}>
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
                  <Area type="monotone" dataKey="income" name="Daromad" stroke="#34D399" fill="url(#incomeGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#F87171" fill="url(#expenseGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Project performance + task stats */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Eng foydali loyihalar</h2>
              {topProfit.length === 0 ? (
                <p className="text-muted text-[12.5px] py-4 text-center">Ma'lumot yo'q</p>
              ) : (
                topProfit.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:bg-raised px-1.5 -mx-1.5 rounded transition-colors text-left"
                  >
                    <span className="text-[13px] truncate">{p.name}</span>
                    <span className={`num text-[12.5px] shrink-0 ml-2 ${p.profit >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {p.profit >= 0 ? '+' : ''}{p.profit.toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="card">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Eng ko'p sarflangan</h2>
              {topSpending.length === 0 ? (
                <p className="text-muted text-[12.5px] py-4 text-center">Ma'lumot yo'q</p>
              ) : (
                topSpending.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:bg-raised px-1.5 -mx-1.5 rounded transition-colors text-left"
                  >
                    <span className="text-[13px] truncate">{p.name}</span>
                    <span className="num text-[12.5px] text-negative shrink-0 ml-2">
                      -{p.expense.toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="card">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Vazifalar holati</h2>
              {analytics?.taskStats && (
                <div className="space-y-3">
                  {[
                    { label: 'Bajarilgan', value: analytics.taskStats.completed, tone: 'bg-positive' },
                    { label: 'Jarayonda', value: analytics.taskStats.inProgress, tone: 'bg-accent' },
                    { label: 'Todo', value: analytics.taskStats.todo, tone: 'bg-muted' },
                    { label: 'Muddati o\'tgan', value: analytics.taskStats.overdue, tone: 'bg-negative' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-muted">{s.label}</span>
                        <span className="num">{s.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-ink rounded-full overflow-hidden">
                        <div className={`h-full ${s.tone}`} style={{ width: `${Math.min(100, s.value * 10)}%` }} />
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
