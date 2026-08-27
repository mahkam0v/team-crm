import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/Avatar.jsx';

export const ProjectNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [directory, setDirectory] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    client: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    startDate: '',
    deadline: '',
    budget: '',
    expectedIncome: '',
    expectedExpense: '',
    note: '',
  });

  useEffect(() => {
    api.userDirectory().then((r) => setDirectory(r.users.filter((u) => u.id !== user.id)));
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Loyiha nomini kiriting');
    setSubmitting(true);
    try {
      const { project } = await api.createProject({
        name: form.name,
        description: form.description || undefined,
        client: form.client || undefined,
        priority: form.priority,
        status: form.status,
        startDate: form.startDate || undefined,
        deadline: form.deadline || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        expectedIncome: form.expectedIncome ? Number(form.expectedIncome) : undefined,
        expectedExpense: form.expectedExpense ? Number(form.expectedExpense) : undefined,
        memberIds: selectedMembers,
        note: form.note || undefined,
      });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/projects" className="text-[12.5px] text-muted hover:text-white">&larr; Loyihalar</Link>
      <h1 className="font-display text-xl font-semibold tracking-tight mt-1 mb-6">Yangi loyiha yaratish</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-negative text-[12.5px]">{error}</p>}

        <div className="card space-y-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted">Umumiy ma'lumot</h2>
          <input className="field" placeholder="Loyiha nomi *" value={form.name} onChange={set('name')} />
          <textarea className="field" rows={3} placeholder="Tavsif" value={form.description} onChange={set('description')} />
          <input className="field" placeholder="Mijoz / klient (ixtiyoriy)" value={form.client} onChange={set('client')} />

          <div className="grid grid-cols-2 gap-3">
            <select className="field mb-0" value={form.priority} onChange={set('priority')}>
              <option value="LOW">Past prioritet</option>
              <option value="MEDIUM">O'rtacha prioritet</option>
              <option value="HIGH">Yuqori prioritet</option>
              <option value="URGENT">Shoshilinch</option>
            </select>
            <select className="field mb-0" value={form.status} onChange={set('status')}>
              <option value="PLANNING">Rejalashtirish</option>
              <option value="IN_PROGRESS">Faol</option>
              <option value="ON_HOLD">Kutmoqda</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Boshlanish sanasi</label>
              <input className="field mb-0" type="date" value={form.startDate} onChange={set('startDate')} />
            </div>
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Muddat (deadline)</label>
              <input className="field mb-0" type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted">Moliya rejasi</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Byudjet (so'm)</label>
              <input className="field mb-0" type="number" placeholder="0" value={form.budget} onChange={set('budget')} />
            </div>
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Kutilgan daromad</label>
              <input className="field mb-0" type="number" placeholder="0" value={form.expectedIncome} onChange={set('expectedIncome')} />
            </div>
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Kutilgan xarajat</label>
              <input className="field mb-0" type="number" placeholder="0" value={form.expectedExpense} onChange={set('expectedExpense')} />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted">Jamoa</h2>
          {directory.length === 0 ? (
            <p className="text-muted text-[12.5px]">Boshqa foydalanuvchi yo'q</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {directory.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => toggleMember(u.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[12.5px] transition-colors ${
                    selectedMembers.includes(u.id)
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-border text-muted hover:text-white'
                  }`}
                >
                  <Avatar username={u.username} size={5} />
                  {u.username}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card space-y-2">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted">Eslatma (ixtiyoriy)</h2>
          <textarea className="field mb-0" rows={2} placeholder="Boshlang'ich eslatma yoki talablar..." value={form.note} onChange={set('note')} />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Yaratilmoqda...' : 'Loyihani yaratish'}
          </button>
          <button type="button" onClick={() => navigate('/projects')} className="btn-ghost">Bekor qilish</button>
        </div>
      </form>
    </div>
  );
};
