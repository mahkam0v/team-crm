import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, statusLabel } from '../components/Avatar.jsx';

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold tracking-tight">Profil sozlamalari</h1>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saqlanmoqda...' : saved ? 'Saqlandi ✓' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="card">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-4">Shaxsiy ma'lumotlar</h2>

          <div className="flex items-center gap-4 mb-5">
            <Avatar username={user.username} size={16} showStatus={form.status} />
            <div>
              <div className="text-[15px] font-semibold">{user.username}</div>
              <div className="text-[12.5px] text-muted">{user.email}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Username</label>
              <input className="field mb-0" value={user.username} disabled />
            </div>
            <div>
              <label className="text-[11.5px] text-muted block mb-1">Email</label>
              <input className="field mb-0" value={user.email} disabled />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[11.5px] text-muted block mb-1">Holat</label>
            <select className="field mb-0" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="AVAILABLE">🟢 Mavjud</option>
              <option value="BUSY">🟡 Band</option>
              <option value="DO_NOT_DISTURB">🔴 Bezovta qilmang</option>
              <option value="OFFLINE">⚫ Offline</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="text-[11.5px] text-muted block mb-1">Hozir nima ustida ishlayapsiz</label>
            <input
              className="field mb-0"
              placeholder="masalan: CRM loyihasi frontend qismi"
              value={form.currentlyWorkingOn}
              onChange={(e) => setForm({ ...form, currentlyWorkingOn: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[11.5px] text-muted block mb-1">Qisqacha tavsif</label>
            <textarea
              className="field mb-0"
              rows={3}
              placeholder="O'zingiz haqingizda..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-1">Akkaunt</h2>
            <div className="text-[12.5px] text-muted space-y-1.5 mt-2">
              <div className="flex justify-between"><span>Rol</span><span className="text-accent font-mono text-[11px]">{user.role}</span></div>
              <div className="flex justify-between"><span>Qo'shilgan sana</span><span>{new Date(user.createdAt).toLocaleDateString('uz-UZ')}</span></div>
              <div className="flex justify-between"><span>Holat</span><span>{statusLabel[form.status]}</span></div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-3">Faoliyat statistikasi</h2>
            {stats ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="num text-[20px]">{stats.projectsCount}</div>
                  <div className="text-[11px] text-muted">Loyihada ishtirok</div>
                </div>
                <div>
                  <div className="num text-[20px]">{stats.completedTasks}</div>
                  <div className="text-[11px] text-muted">Bajarilgan vazifa</div>
                </div>
                <div>
                  <div className="num text-[20px]">{stats.achievementsCount}</div>
                  <div className="text-[11px] text-muted">Yutuqlar</div>
                </div>
                <div>
                  <div className="num text-[20px]">{stats.activeDays}</div>
                  <div className="text-[11px] text-muted">Faol kunlar</div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-[12.5px]">Yuklanmoqda...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
