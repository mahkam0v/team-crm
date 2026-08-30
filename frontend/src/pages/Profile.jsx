import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, statusLabel } from '../components/Avatar.jsx';
import { Skeleton } from '../components/Skeleton.jsx';

export const Profile = () => {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ bio: '', currentlyWorkingOn: '', status: 'AVAILABLE' });
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({ bio: user.bio || '', currentlyWorkingOn: user.currentlyWorkingOn || '', status: user.status || 'AVAILABLE' });
    api.profileStats().then(setStats);
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.updateProfile(form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Profil sozlamalari</h1>
          <p className="text-muted text-[13px] mt-0.5">Shaxsiy ma'lumotlaringizni yangilang</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary group">
          <span className="flex items-center gap-2">
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Saqlanmoqda...
              </>
            ) : saved ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-positive">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Saqlandi ✓
              </>
            ) : (
              'Saqlash'
            )}
          </span>
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        {/* Main form */}
        <div className="card animate-fade-in stagger-1">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-4">Shaxsiy ma'lumotlar</h2>

          <div className="flex items-center gap-4 mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <Avatar username={user.username} size={16} showStatus={form.status} />
            <div>
              <div className="text-[15px] font-semibold">{user.username}</div>
              <div className="text-[12.5px] text-muted">{user.email}</div>
              <div className="mt-1">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                  user.role === 'SUPER_ADMIN' ? 'bg-negative/15 text-negative' :
                  user.role === 'ADMIN' ? 'bg-warning/15 text-warning' : 'bg-accent/15 text-accent'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11.5px] text-muted block mb-1.5">Username</label>
              <input className="field mb-0 bg-white/5" value={user.username} disabled />
            </div>
            <div>
              <label className="text-[11.5px] text-muted block mb-1.5">Email</label>
              <input className="field mb-0 bg-white/5" value={user.email} disabled />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[11.5px] text-muted block mb-1.5">Holat</label>
            <select className="field mb-0" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="AVAILABLE">🟢 Mavjud</option>
              <option value="BUSY">🟡 Band</option>
              <option value="DO_NOT_DISTURB">🔴 Bezovta qilmang</option>
              <option value="OFFLINE">⚫ Offline</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="text-[11.5px] text-muted block mb-1.5">Hozir nima ustida ishlayapsiz</label>
            <input
              className="field mb-0"
              placeholder="masalan: CRM loyihasi frontend qismi"
              value={form.currentlyWorkingOn}
              onChange={(e) => setForm({ ...form, currentlyWorkingOn: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[11.5px] text-muted block mb-1.5">Qisqacha tavsif</label>
            <textarea
              className="field mb-0"
              rows={3}
              placeholder="O'zingiz haqingizda..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 animate-fade-in stagger-2">
          {/* Account info */}
          <div className="card">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-1">Akkaunt</h2>
            <div className="text-[12.5px] text-muted space-y-2 mt-3">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span>Rol</span>
                <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-md ${
                  user.role === 'SUPER_ADMIN' ? 'bg-negative/15 text-negative' :
                  user.role === 'ADMIN' ? 'bg-warning/15 text-warning' : 'bg-accent/15 text-accent'
                }`}>{user.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span>Qo'shilgan sana</span>
                <span>{new Date(user.createdAt).toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Holat</span>
                <span>{statusLabel[form.status]}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Faoliyat statistikasi</h2>
            {stats ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: stats.projectsCount, label: 'Loyihada ishtirok', color: 'text-accent' },
                  { value: stats.completedTasks, label: 'Bajarilgan vazifa', color: 'text-positive' },
                  { value: stats.achievementsCount, label: 'Yutuqlar', color: 'text-warning' },
                  { value: stats.activeDays, label: 'Faol kunlar', color: 'text-white' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                    <div className={`num text-[22px] font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
