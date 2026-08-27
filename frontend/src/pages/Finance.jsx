import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { PendingActions } from '../components/PendingActions.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

const statusLabels = { PENDING: 'Kutilmoqda', RECEIVED_PAID: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const statusColors = { PENDING: 'text-warning', RECEIVED_PAID: 'text-positive', CANCELLED: 'text-muted' };

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

  return (
    <div>
      <h1 className="font-display text-xl font-semibold tracking-tight mb-6">Moliya</h1>

      <form onSubmit={handleCreate} className="card mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-3">Yangi tranzaksiya</h2>
        {error && <p className="text-negative text-[12.5px] mb-2">{error}</p>}

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

          <button className="btn-primary">Qo'shish</button>
        </div>
        <p className="text-[11.5px] text-muted mt-2">
          Loyiha tanlasangiz, bu tranzaksiya avtomatik o'sha loyihaning moliya hisobiga qo'shiladi.
        </p>
      </form>

      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Barcha tranzaksiyalar</h2>
          <div className="flex gap-1 bg-ink border border-border rounded p-1">
            {[
              { v: 'ALL', l: 'Hammasi' },
              { v: 'PENDING', l: `Kutilmoqda${pendingCount ? ` (${pendingCount})` : ''}` },
              { v: 'RECEIVED_PAID', l: 'Bajarilgan' },
              { v: 'CANCELLED', l: 'Bekor qilingan' },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                className={`text-[11.5px] px-2.5 py-1.5 rounded transition-colors ${
                  filter === f.v ? 'bg-accent text-white' : 'text-muted hover:text-white'
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💸" title="Bu bo'limda tranzaksiya yo'q" />
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
              <div className="min-w-0">
                <div className="text-[13.5px] truncate">{t.description || t.category || '—'}</div>
                <div className="text-[11px] text-muted mt-0.5">
                  <span className={statusColors[t.status]}>{statusLabels[t.status]}</span>
                  {' · '}{new Date(t.date).toLocaleDateString('uz-UZ')}
                  {t.projectId && (
                    <>
                      {' · '}
                      <Link to={`/projects/${t.projectId}`} className="text-accent hover:underline">
                        {projectName(t.projectId) || 'Loyiha'}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`num text-[14px] ${t.type === 'INCOME' ? 'text-positive' : 'text-negative'}`}>
                  {t.type === 'INCOME' ? '+' : '−'}{Number(t.amount).toLocaleString()} so'm
                </span>
                {t.status === 'PENDING' && (
                  <PendingActions
                    onComplete={() => handleStatusChange(t.id, 'RECEIVED_PAID')}
                    onCancel={() => handleStatusChange(t.id, 'CANCELLED')}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
