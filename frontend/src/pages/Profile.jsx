import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, statusLabel } from '../components/Avatar.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { Icon } from '../components/Icon.jsx';
import toast from 'react-hot-toast';

const Profile = () => {
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
    try {
      await api.updateProfile(form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success('Profil saqlandi!');
    } catch (err) {
      toast.error(err.message || 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight animate-fade-in">
            <span className="gradient-text">Profil</span>
          </h1>
          <p className="text-muted/60 text-[12.5px] mt-0.5 animate-fade-in stagger-1">Shaxsiy ma'lumotlaringizni yangilang</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary animate-fade-in stagger-2">
          <span className="flex items-center gap-1.5">
            {saving ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Saqlanmoqda...
              </>
            ) : saved ? (
              <>
                <Icon name="check" className="w-3.5 h-3.5" />
                Saqlandi
              </>
            ) : (
              <>
                <Icon name="save" className="w-3.5 h-3.5" />
                Saqlash
              </>
            )}
          </span>
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        {/* Main form */}
        <div className="card animate-fade-in stagger-1">
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-accent/5 rounded-xl border border-accent/10">
            <Avatar username={user.username} size={16} showStatus={form.status} />
            <div>
              <div className="text-[16px] font-bold">{user.username}</div>
              <div className="text-[12px] text-muted/50">{user.email}</div>
              <div className="mt-1.5">
                <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                  user.role === 'SUPER_ADMIN' ? 'bg-negative/10 text-negative' :
                  user.role === 'ADMIN' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <h2 className="section-heading"><h2>Shaxsiy ma'lumotlar</h2></h2>

          <div className="grid sm:grid-cols-2 gap-2.5 mb-4">
            <div>
              <label className="text-[10.5px] text-muted/40 block mb-1">Username</label>
              <input className="field mb-0 bg-white/[0.02] opacity-50" value={user.username} disabled />
            </div>
            <div>
              <label className="text-[10.5px] text-muted/40 block mb-1">Email</label>
              <input className="field mb-0 bg-white/[0.02] opacity-50" value={user.email} disabled />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10.5px] text-muted/40 block mb-1">Holat</label>
            <select className="field mb-0" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="AVAILABLE">Mavjud</option>
              <option value="BUSY">Band</option>
              <option value="DO_NOT_DISTURB">Bezovta qilmang</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-[10.5px] text-muted/40 block mb-1">Hozir nima ustida ishlayapsiz</label>
            <input
              className="field mb-0"
              placeholder="masalan: CRM loyihasi frontend qismi"
              value={form.currentlyWorkingOn}
              onChange={(e) => setForm({ ...form, currentlyWorkingOn: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10.5px] text-muted/40 block mb-1">Qisqacha tavsif</label>
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
        <div className="space-y-3 animate-fade-in stagger-2">
          {/* Account info */}
          <div className="card">
            <h2 className="section-heading"><h2>Akkaunt</h2></h2>
            <div className="text-[12px] text-muted/50 space-y-0">
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03]">
                <span>Rol</span>
                <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                  user.role === 'SUPER_ADMIN' ? 'bg-negative/10 text-negative' :
                  user.role === 'ADMIN' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
                }`}>{user.role}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/[0.03]">
                <span>Qo'shilgan sana</span>
                <span className="text-white/50">{new Date(user.createdAt).toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span>Holat</span>
                <span className="text-white/50">{statusLabel[form.status]}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h2 className="section-heading"><h2>Faoliyat statistikasi</h2></h2>
            {stats ? (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: stats.projectsCount, label: 'Loyihada', color: 'text-accent', icon: 'folder' },
                  { value: stats.completedTasks, label: 'Bajarilgan', color: 'text-positive', icon: 'check_circle' },
                  { value: stats.achievementsCount, label: 'Yutuqlar', color: 'text-warning', icon: 'award' },
                  { value: stats.activeDays, label: 'Faol kunlar', color: 'text-info', icon: 'calendar' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 bg-white/[0.02] rounded-lg border border-white/[0.03] hover:border-white/[0.06] transition-colors">
                    <Icon name={s.icon} className={`w-4 h-4 mx-auto mb-1 ${s.color} opacity-50`} />
                    <div className={`num text-[20px] font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-muted/40 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center p-3">
                    <Skeleton className="w-6 h-6 mx-auto mb-1.5 rounded" />
                    <Skeleton className="h-5 w-10 mx-auto mb-1" />
                    <Skeleton className="h-2.5 w-14 mx-auto" />
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

export default Profile;
