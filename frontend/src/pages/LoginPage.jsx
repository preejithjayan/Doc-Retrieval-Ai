import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate('/dashboard');
    } catch {
      setError('Unable to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-console-muted">Sign in</p>
      <h1 className="mt-2 text-3xl font-semibold text-console-text">Access the operations console</h1>
      <p className="mt-2 text-sm leading-7 text-console-muted">Use your account to manage documents, retrieval, chat operations, and model routing.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full" />
        <input placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="console-button-primary w-full px-5 py-3 text-sm font-semibold">Sign in</button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="font-semibold text-console-blue">Forgot password?</Link>
        <Link to="/register" className="font-semibold text-console-blue">Create account</Link>
      </div>
    </div>
  );
}

