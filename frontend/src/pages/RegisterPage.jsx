import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', confirm_password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await register(form);
    setMessage('Account created. You can sign in now.');
    setTimeout(() => navigate('/login'), 800);
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-console-muted">Create account</p>
      <h1 className="mt-2 text-3xl font-semibold text-console-text">Request console access</h1>
      <p className="mt-2 text-sm leading-7 text-console-muted">New registrations start with viewer access and can be elevated by an administrator.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input placeholder="First name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} className="w-full" />
          <input placeholder="Last name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} className="w-full" />
        </div>
        <input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full" />
        <input placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full" />
        <input placeholder="Confirm password" type="password" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} className="w-full" />
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <button className="console-button-primary w-full px-5 py-3 text-sm font-semibold">Create account</button>
      </form>
      <div className="mt-6 text-sm text-console-muted">
        Already have access? <Link to="/login" className="font-semibold text-console-blue">Sign in</Link>
      </div>
    </div>
  );
}

