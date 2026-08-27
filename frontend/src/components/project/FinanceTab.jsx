import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { PendingActions } from '../PendingActions.jsx';
import { EmptyState } from '../EmptyState.jsx';

const statusLabels = { PENDING: 'Kutilmoqda', RECEIVED_PAID: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const statusColors = { PENDING: 'text-warning', RECEIVED_PAID: 'text-positive', CANCELLED: 'text-muted' };

export const FinanceTab = ({ projectId, onChanged }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'INCOME',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'PENDING',
  });

  const load = () => api.getProjectTransactions(projectId).then((r) => setTransactions(r.transactions)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError("Summani to'g'ri kiriting");
    try {
      await api.createTransaction({ ...form, amount, projectId });
      setForm({ ...form, amount: '', description: '' });
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    setTransactions((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.updateTransactionStatus(id, status);
    onChanged?.();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="card mb-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">
          Bu loyihaga daromad / xarajat qo'shish
        </h2>
        {error && <p className="text-negative text-[12.5px] mb-2">{error}</p>}
        <div className="grid sm:grid-cols-5 gap-2">
          <select className="field mb-0" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INCOME">Daromad</option>
            <option value="EXPENSE">Xarajat</option>
          </select>
          <input className="field mb-0" type="number" placeholder="Summasi" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="field mb-0" placeholder="Sabab" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="field mb-0" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PENDING">Kutilmoqda</option>
            <option value="RECEIVED_PAID">Bajarildi</option>
          </select>
          <button className="btn-primary">Qo'shish</button>
        </div>
      </form>

      <div className="card">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-1">Loyiha tranzaksiyalari</h2>
        {loading ? (
          <p className="text-muted text-sm py-4">Yuklanmoqda...</p>
        ) : transactions.length === 0 ? (
          <EmptyState icon="💸" title="Bu loyihada hali tranzaksiya yo'q" />
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
              <div className="min-w-0">
                <div className="text-[13.5px] truncate">{t.description || t.category || '—'}</div>
                <div className="text-[11px] text-muted mt-0.5">
                  <span className={statusColors[t.status]}>{statusLabels[t.status]}</span>
                  {' · '}{new Date(t.date).toLocaleDateString('uz-UZ')}
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
