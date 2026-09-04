import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { PendingActions } from '../components/PendingActions.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/Icon.jsx';
import toast from 'react-hot-toast';

const statusLabels = { PENDING: 'Kutilmoqda', RECEIVED_PAID: 'Bajarildi', CANCELLED: 'Bekor qilindi' };
const statusStyles = {
  PENDING: 'bg-warning/10 text-warning border border-warning/15',
  RECEIVED_PAID: 'bg-positive/10 text-positive border border-positive/15',
  CANCELLED: 'bg-white/[0.04] text-muted/60 border border-white/[0.06]',
};
const typeConfig = {
  INCOME: { icon: 'trending_up', color: 'text-positive' },
  EXPENSE: { icon: 'trending_down', color: 'text-negative' },
};

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
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
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return toast.error("Summani to'g'ri kiriting");
    try {
      await api.createTransaction({ ...form, amount, projectId: form.projectId || undefined });
      setForm({ ...form, amount: '', description: '', projectId: '' });
      load();
      toast.success('Tranzaksiya qo\'shildi!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    setTransactions((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.updateTransactionStatus(id, status);
    toast.success(`Tranzaksiya ${statusLabels[status].toLowerCase()}`);
  };

  const handleExportCSV = () => {
    const filtered = getFiltered();
    const headers = ['Sana', 'Turi', 'Summa', 'Tavsif', 'Holat', 'Loyiha'];
    const rows = filtered.map((t) => [
      new Date(t.date).toLocaleDateString('uz-UZ'),
      t.type === 'INCOME' ? 'Daromad' : 'Xarajat',
      t.amount,
      t.description || '',
      statusLabels[t.status],
      projectName(t.projectId) || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moliya-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFiltered = () => {
    return transactions.filter((t) => {
      if (filter !== 'ALL' && t.status !== filter) return false;
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  };

  const filtered = getFiltered();
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const totalIncome = transactions.filter((t) => t.type === 'INCOME' && t.status === 'RECEIVED_PAID').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE' && t.status === 'RECEIVED_PAID').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight animate-fade-in">
            <span className="gradient-text">Moliya</span>
          </h1>
          <p className="text-muted/60 text-[12.5px] mt-0.5 animate-fade-in stagger-1">
            {transactions.length} ta tranzaksiya
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-ghost border border-white/[0.06] hover:border-white/[0.1] text-[12px] flex items-center gap-1.5 animate-fade-in stagger-2"
        >
          <Icon name="download" className="w-3.5 h-3.5" />
          CSV yuklab olish
        </button>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 animate-fade-in stagger-1">
          <div className="card border-l-[3px] border-l-positive hover:border-white/[0.08] transition-all duration-200">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="trending_up" className="w-3.5 h-3.5 text-positive/60" />
              <span className="text-[10.5px] uppercase tracking-wider text-muted/50 font-medium">Jami daromad</span>
            </div>
            <div className="num text-[22px] mt-1 text-positive font-bold">
              +{totalIncome.toLocaleString()} <span className="text-[12px] text-muted/40 font-normal">so'm</span>
            </div>
          </div>
          <div className="card border-l-[3px] border-l-negative hover:border-white/[0.08] transition-all duration-200">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="trending_down" className="w-3.5 h-3.5 text-negative/60" />
              <span className="text-[10.5px] uppercase tracking-wider text-muted/50 font-medium">Jami xarajat</span>
            </div>
            <div className="num text-[22px] mt-1 text-negative font-bold">
              -{totalExpense.toLocaleString()} <span className="text-[12px] text-muted/40 font-normal">so'm</span>
            </div>
          </div>
          <div className={`card border-l-[3px] ${balance >= 0 ? 'border-l-positive' : 'border-l-negative'} hover:border-white/[0.08] transition-all duration-200`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="wallet" className="w-3.5 h-3.5 text-muted/40" />
              <span className="text-[10.5px] uppercase tracking-wider text-muted/50 font-medium">Balans</span>
            </div>
            <div className={`num text-[22px] mt-1 font-bold ${balance >= 0 ? 'text-positive' : 'text-negative'}`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString()} <span className="text-[12px] text-muted/40 font-normal">so'm</span>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="card mb-5 animate-fade-in stagger-2">
        <h2 className="section-heading"><h2>Yangi tranzaksiya</h2></h2>
        {error && (
          <div className="bg-negative/8 border border-negative/15 text-negative text-[12px] rounded-lg px-3 py-2 mb-3 animate-fade-in">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
          <select className="field mb-0" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INCOME">Daromad</option>
            <option value="EXPENSE">Xarajat</option>
          </select>

          <select className="field mb-0" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Loyihasiz</option>
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
            <span className="flex items-center justify-center gap-1.5">
              <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
              Qo'shish
            </span>
          </button>
        </div>
        <p className="text-[10.5px] text-muted/30 mt-2">
          Loyiha tanlasangiz, bu tranzaksiya avtomatik o'sha loyihasining moliya hisobiga qo'shiladi.
        </p>
      </form>

      {/* Transactions list */}
      <div className="card animate-fade-in stagger-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h2 className="section-heading"><h2>Barcha tranzaksiyalar</h2></h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search */}
            <div className="relative">
              <Icon name="search" className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/30" />
              <input
                className="field mb-0 pl-7 py-1 text-[11.5px] w-36"
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Type filter */}
            <div className="flex gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-lg p-0.5">
              {[{ v: 'ALL', l: 'Hammasi' }, { v: 'INCOME', l: 'Daromad' }, { v: 'EXPENSE', l: 'Xarajat' }].map((f) => (
                <button
                  key={f.v}
                  onClick={() => setTypeFilter(f.v)}
                  className={`segment-btn text-[10.5px] px-2 ${typeFilter === f.v ? 'active' : ''}`}
                >
                  {f.l}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <div className="flex gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-lg p-0.5">
              {[
                { v: 'ALL', l: 'Hammasi' },
                { v: 'PENDING', l: `Kutilmoqda${pendingCount ? ` (${pendingCount})` : ''}` },
                { v: 'RECEIVED_PAID', l: 'Bajarilgan' },
                { v: 'CANCELLED', l: 'Bekor qilingan' },
              ].map((f) => (
                <button
                  key={f.v}
                  onClick={() => setFilter(f.v)}
                  className={`segment-btn text-[10.5px] px-2 whitespace-nowrap ${filter === f.v ? 'active' : ''}`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="w-28 h-5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="receipt" title="Bu bo'limda tranzaksiya yo'q" />
        ) : (
          <div className="space-y-0">
            {filtered.map((t) => {
              const tc = typeConfig[t.type];
              return (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0 gap-3 group hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'INCOME' ? 'bg-positive/8' : 'bg-negative/8'}`}>
                      <Icon name={tc.icon} className={`w-3.5 h-3.5 ${tc.color}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] truncate text-white/70 group-hover:text-white transition-colors">{t.description || t.category || '—'}</div>
                      <div className="text-[10.5px] text-muted/40 mt-0.5 flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-medium ${statusStyles[t.status]}`}>
                          {statusLabels[t.status]}
                        </span>
                        <span className="text-white/10">·</span>
                        <span>{new Date(t.date).toLocaleDateString('uz-UZ')}</span>
                        {t.projectId && (
                          <>
                            <span className="text-white/10">·</span>
                            <Link to={`/projects/${t.projectId}`} className="text-accent hover:text-accent-light transition-colors hover:underline">
                              {projectName(t.projectId) || 'Loyiha'}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`num text-[13.5px] font-semibold ${t.type === 'INCOME' ? 'text-positive' : 'text-negative'}`}>
                      {t.type === 'INCOME' ? '+' : '−'}{Number(t.amount).toLocaleString()} <span className="text-[10.5px] text-muted/40 font-normal">so'm</span>
                    </span>
                    {t.status === 'PENDING' && (
                      <PendingActions
                        onComplete={() => handleStatusChange(t.id, 'RECEIVED_PAID')}
                        onCancel={() => handleStatusChange(t.id, 'CANCELLED')}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
