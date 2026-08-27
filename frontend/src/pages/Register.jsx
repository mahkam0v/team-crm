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
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-[360px] card">
        <h1 className="font-display text-xl font-semibold tracking-tight mb-1">Ro'yxatdan o'tish</h1>
        <p className="text-muted text-[13px] mb-5">Birinchi ro'yxatdan o'tgan user Super Admin bo'ladi</p>

        {error && <p className="text-negative text-[12.5px] mb-3">{error}</p>}

        <input className="field mb-3" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input className="field mb-3" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="field mb-4" type="password" placeholder="Parol (min 8 belgi)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
        </button>

        <p className="text-muted text-[12.5px] mt-4 text-center">
          Akkaunt bormi? <Link to="/login" className="text-accent hover:underline">Kirish</Link>
        </p>
      </form>
    </div>
  );
};
