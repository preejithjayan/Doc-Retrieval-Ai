import { Link } from 'react-router-dom';
import { useState } from 'react';

import authService from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await authService.requestPasswordReset({ email });
    setMessage('If the email exists, a reset link has been sent.');
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-console-muted">Password reset</p>
      <h1 className="mt-2 text-3xl font-semibold text-console-text">Request a reset link</h1>
      <p className="mt-2 text-sm leading-7 text-console-muted">Enter the email address associated with your console account.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full" />
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <button className="console-button-primary w-full px-5 py-3 text-sm font-semibold">Send reset email</button>
      </form>
      <div className="mt-6 text-sm text-console-muted">
        <Link to="/login" className="font-semibold text-console-blue">Back to sign in</Link>
      </div>
    </div>
  );
}

