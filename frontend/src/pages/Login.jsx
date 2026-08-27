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
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-[360px] card">
        <h1 className="font-display text-xl font-semibold tracking-tight mb-1">
          Team<span className="text-accent">CRM</span>
        </h1>
        <p className="text-muted text-[13px] mb-5">Akkauntingizga kiring</p>

        {error && <p className="text-negative text-[12.5px] mb-3">{error}</p>}

        <input className="field mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field mb-4" type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Yuklanmoqda...' : 'Kirish'}
        </button>

        <p className="text-muted text-[12.5px] mt-4 text-center">
          Akkaunt yo'qmi? <Link to="/register" className="text-accent hover:underline">Ro'yxatdan o'tish</Link>
        </p>
      </form>
    </div>
  );
};
