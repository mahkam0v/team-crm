import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
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
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #12141C 0%, #1a1d2e 30%, #1B2845 60%, #12141C 100%)',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-positive/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-warning/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(91,141,239,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(91,141,239,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-accent">
              <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" />
            </svg>
          </div>

          <h1 className="font-display text-4xl font-bold mb-4">
            <span className="gradient-text">Team</span>
            <span className="text-white">CRM</span>
          </h1>

          <p className="text-muted text-lg max-w-sm mx-auto leading-relaxed">
            Jamoangiz bilan loyihalarni boshqaring, vazifalarni tashkillang va moliyani nazorat qiling.
          </p>

          <div className="flex items-center justify-center gap-8 mt-10">
            {[
              { icon: '📊', label: 'Dashboard' },
              { icon: '📁', label: 'Loyihalar' },
              { icon: '💰', label: 'Moliya' },
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
        {/* Subtle background */}
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="w-full max-w-[380px] relative z-10 animate-fade-in-scale">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl font-bold">
              <span className="gradient-text">Team</span>
              <span className="text-accent">CRM</span>
            </h1>
          </div>

          <div className="card bg-surface/80 backdrop-blur-xl border-white/10 shadow-2xl">
            <h2 className="font-display text-xl font-semibold tracking-tight mb-1">
              Xush kelibsiz
            </h2>
            <p className="text-muted text-[13px] mb-6">Akkauntingizga kiring</p>

            {error && (
              <div className="bg-negative/10 border border-negative/20 text-negative text-[12.5px] rounded-lg px-3 py-2 mb-4 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11.5px] text-muted block mb-1.5">Email</label>
                <input
                  className="field bg-white/5 border-white/10 focus:border-accent focus:bg-white/5"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11.5px] text-muted block mb-1.5">Parol</label>
                <input
                  className="field bg-white/5 border-white/10 focus:border-accent focus:bg-white/5"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                    'Kirish'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-muted text-[12.5px] text-center">
                Akkaunt yo'qmi?{' '}
                <Link
                  to="/register"
                  className="text-accent hover:text-accent-hover font-medium hover:underline transition-colors"
                >
                  Ro'yxatdan o'tish
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted/50 mt-6">
            Team CRM — Jamoa boshqaruv tizimi
          </p>
        </div>
      </div>
    </div>
  );
};
