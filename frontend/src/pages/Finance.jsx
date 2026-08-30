import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { PendingActions } from '../components/PendingActions.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { Skeleton } from '../components/Skeleton.jsx';

const statusLabels = { PENDING: 'Kutilmoqda', RECEIVED_PAID: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const statusColors = {
  PENDING: 'bg-warning/15 text-warning',
  RECEIVED_PAID: 'bg-positive/15 text-positive',
  CANCELLED: 'bg-muted/15 text-muted',
};

export const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({
    type: 'INCOME',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'PENDING',
    projectId: '',
  });

  const load = () => {
    Promise.all([api.listTransactions(), api.listProjects()])
      .then(([tx, pr]) => {
        setTransactions(tx.transactions);
        setProjects(pr.projects);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const projectName = (id) => projects.find((p) => p.id === id)?.name;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError("Summani to'g'ri kiriting");
    try {
      await api.createTransaction({ ...form, amount, projectId: form.projectId || undefined });
      setForm({ ...form, amount: '', description: '', projectId: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    setTransactions((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.updateTransactionStatus(id, status);
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter((t) => t.status === filter);
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const totalIncome = transactions.filter((t) => t.type === 'INCOME' && t.status === 'RECEIVED_PAID').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE' && t.status === 'RECEIVED_PAID').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold tracking-tight">Moliya</h1>
        <p className="text-muted text-[13px] mt-0.5">{transactions.length} ta tranzaksiya</p>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 animate-fade-in stagger-1">
          <div className="card border-l-[3px] border-l-positive">
            <div className="text-[11.5px] uppercase tracking-wide text-muted">Jami daromad</div>
            <div className="num text-[20px] mt-1 text-positive font-bold">+{totalIncome.toLocaleString()} <span className="text-[13px] text-muted font-normal">so'm</span></div>
          </div>
          <div className="card border-l-[3px] border-l-negative">
            <div className="text-[11.5px] uppercase tracking-wide text-muted">Jami xarajat</div>
            <div className="num text-[20px] mt-1 text-negative font-bold">-{totalExpense.toLocaleString()} <span className="text-[13px] text-muted font-normal">so'm</span></div>
          </div>
          <div className={`card border-l-[3px] ${totalIncome - totalExpense >= 0 ? 'border-l-positive' : 'border-l-negative'}`}>
            <div className="text-[11.5px] uppercase tracking-wide text-muted">Balans</div>
            <div className={`num text-[20px] mt-1 font-bold ${totalIncome - totalExpense >= 0 ? 'text-positive' : 'text-negative'}`}>
              {totalIncome - totalExpense >= 0 ? '+' : ''}{(totalIncome - totalExpense).toLocaleString()} <span className="text-[13px] text-muted font-normal">so'm</span>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="card mb-5 animate-fade-in stagger-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-3">Yangi tranzaksiya</h2>
        {error && (
          <div className="bg-negative/10 border border-negative/20 text-negative text-[12.5px] rounded-lg px-3 py-2 mb-3 animate-fade-in">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-6 gap-2">
          <select className="field mb-0" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INCOME">Daromad</option>
            <option value="EXPENSE">Xarajat</option>
          </select>

          <select className="field mb-0" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Loyihasiz (umumiy)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input className="field mb-0" type="number" placeholder="Summasi" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="field mb-0" placeholder="Sabab / tavsif" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <select className="field mb-0" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PENDING">Kutilmoqda</option>
            <option value="RECEIVED_PAID">Bajarildi</option>
          </select>

          <button className="btn-primary">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Qo'shish
            </span>
          </button>
        </div>
        <p className="text-[11.5px] text-muted mt-2">
          Loyiha tanlasangiz, bu tranzaksiya avtomatik o'sha loyihasining moliya hisobiga qo'shiladi.
        </p>
      </form>

      {/* Transactions list */}
      <div className="card animate-fade-in stagger-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Barcha tranzaksiyalar</h2>
          <div className="flex gap-1 bg-ink border border-border rounded-xl p-1">
            {[
              { v: 'ALL', l: 'Hammasi' },
              { v: 'PENDING', l: `Kutilmoqda${pendingCount ? ` (${pendingCount})` : ''}` },
              { v: 'RECEIVED_PAID', l: 'Bajarilgan' },
              { v: 'CANCELLED', l: 'Bekor qilingan' },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                className={`text-[11.5px] px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                  filter === f.v
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="w-32 h-5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💸" title="Bu bo'limda tranzaksiya yo'q" />
        ) : (
          <div className="space-y-0.5">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 gap-3 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-all duration-200">
                <div className="min-w-0">
                  <div className="text-[13.5px] truncate group-hover:text-white transition-colors">{t.description || t.category || '—'}</div>
                  <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${statusColors[t.status]}`}>
                      {statusLabels[t.status]}
                    </span>
                    <span>·</span>
                    <span>{new Date(t.date).toLocaleDateString('uz-UZ')}</span>
                    {t.projectId && (
                      <>
                        <span>·</span>
                        <Link to={`/projects/${t.projectId}`} className="text-accent hover:underline">
                          {projectName(t.projectId) || 'Loyiha'}
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`num text-[14px] font-medium ${t.type === 'INCOME' ? 'text-positive' : 'text-negative'}`}>
                    {t.type === 'INCOME' ? '+' : '−'}{Number(t.amount).toLocaleString()} <span className="text-[11px] text-muted font-normal">so'm</span>
                  </span>
                  {t.status === 'PENDING' && (
                    <PendingActions
                      onComplete={() => handleStatusChange(t.id, 'RECEIVED_PAID')}
                      onCancel={() => handleStatusChange(t.id, 'CANCELLED')}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
