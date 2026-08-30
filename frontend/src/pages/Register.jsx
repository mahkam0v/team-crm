import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #12141C 0%, #1a2e1b 30%, #1B4528 60%, #12141C 100%)',
          }}
        />

        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-positive/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-positive/20 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-positive">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
            </svg>
          </div>

          <h1 className="font-display text-4xl font-bold mb-4">
            <span className="text-white">Jamoa</span>
            <span className="text-positive"> ga qo'shiling</span>
          </h1>

          <p className="text-muted text-lg max-w-sm mx-auto leading-relaxed">
            Bepul ro'yxatdan o'ting va jamoangiz bilan birga loyihalarni boshqaring.
          </p>

          <div className="flex items-center justify-center gap-6 mt-10">
            {[
              { icon: '🚀', label: 'Tez boshlash' },
              { icon: '🔒', label: 'Xavfsiz' },
              { icon: '💳', label: 'Bepul' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-2 animate-fade-in stagger-${i + 2}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <span className="text-[11px] text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-positive/5 rounded-full blur-3xl" />

        <div className="w-full max-w-[380px] relative z-10 animate-fade-in-scale">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl font-bold">
              <span className="gradient-text">Team</span>
              <span className="text-accent">CRM</span>
            </h1>
          </div>

          <div className="card bg-surface/80 backdrop-blur-xl border-white/10 shadow-2xl">
            <h2 className="font-display text-xl font-semibold tracking-tight mb-1">
              Hisob yaratish
            </h2>
            <p className="text-muted text-[13px] mb-6">Birinchi ro'yxatdan o'tgan user Super Admin bo'ladi</p>

            {error && (
              <div className="bg-negative/10 border border-negative/20 text-negative text-[12.5px] rounded-lg px-3 py-2 mb-4 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11.5px] text-muted block mb-1.5">Username</label>
                <input
                  className="field bg-white/5 border-white/10 focus:border-accent focus:bg-white/5"
                  placeholder="ismingiz"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-[11.5px] text-muted block mb-1.5">Email</label>
                <input
                  className="field bg-white/5 border-white/10 focus:border-accent focus:bg-white/5"
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-[11.5px] text-muted block mb-1.5">Parol</label>
                <input
                  className="field bg-white/5 border-white/10 focus:border-accent focus:bg-white/5"
                  type="password"
                  placeholder="Kamida 8 belgi"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 group relative overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Yuklanmoqda...
                    </span>
                  ) : (
                    "Ro'yxatdan o'tish"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-muted text-[12.5px] text-center">
                Akkaunt bormi?{' '}
                <Link
                  to="/login"
                  className="text-accent hover:text-accent-hover font-medium hover:underline transition-colors"
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
