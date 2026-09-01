import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from '../components/Icon.jsx';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-ink">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-mesh-1" />

        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-positive/6 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-accent/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1.5s' }} />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 text-center px-16 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-positive flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-positive/15 animate-pulse-glow">
            <Icon name="users" className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-5xl font-bold mb-4 tracking-tight">
            <span className="text-white">Jamoa</span>
            <span className="text-positive"> ga qo'shiling</span>
          </h1>

          <p className="text-muted/60 text-lg max-w-md mx-auto leading-relaxed">
            Bepul ro'yxatdan o'ting va jamoangiz bilan birga loyihalarni boshqaring.
          </p>

          <div className="flex items-center justify-center gap-6 mt-10">
            {[
              { icon: 'zap', label: 'Tez boshlash', desc: '1 daqiqada tayyor' },
              { icon: 'shield', label: 'Xavfsiz', desc: "Ma'lumotlar himoyalangan" },
              { icon: 'lock', label: 'Bepul', desc: 'Kredit kartasi talab qilinmaydi' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-2.5 animate-fade-in stagger-${i + 2}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200">
                  <Icon name={item.icon} className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <div className="text-[11.5px] font-medium text-white/70">{item.label}</div>
                  <div className="text-[10px] text-muted/35">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-positive/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/4 rounded-full blur-[80px]" />

        <div className="w-full max-w-[380px] relative z-10 animate-fade-in-scale">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-positive flex items-center justify-center mx-auto mb-4">
              <Icon name="users" className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl font-bold">
              <span className="gradient-text">Team</span>
              <span className="text-white">CRM</span>
            </h1>
          </div>

          <div className="card bg-surface/80 backdrop-blur-xl border-white/[0.06] shadow-elevated p-6">
            <h2 className="font-display text-xl font-bold tracking-tight mb-0.5">
              Hisob yaratish
            </h2>
            <p className="text-muted/50 text-[13px] mb-6">Birinchi ro'yxatdan o'tgan user Super Admin bo'ladi</p>

            {error && (
              <div className="bg-negative/8 border border-negative/15 text-negative text-[12px] rounded-lg px-3 py-2.5 mb-4 animate-fade-in flex items-center gap-2">
                <Icon name="alert_triangle" className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-muted/50 block mb-1.5 font-medium">Username</label>
                <input
                  className="field"
                  placeholder="ismingiz"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-muted/50 block mb-1.5 font-medium">Email</label>
                <input
                  className="field"
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-muted/50 block mb-1.5 font-medium">Parol</label>
                <div className="relative">
                  <input
                    className="field pr-9"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Kamida 8 belgi"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/30 hover:text-muted/60 transition-colors"
                  >
                    <Icon name={showPassword ? 'eye_off' : 'eye'} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 py-2.5 text-[13px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Yuklanmoqda...
                  </span>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/[0.04]">
              <p className="text-muted/40 text-[12.5px] text-center">
                Akkaunt bormi?{' '}
                <Link
                  to="/login"
                  className="text-accent hover:text-accent-light font-medium transition-colors"
                >
                  Kirish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
