import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

import authService from '../services/authService';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await authService.confirmPasswordReset({
      uid: params.get('uid'),
      token: params.get('token'),
      new_password: newPassword,
    });
    setMessage('Password reset complete. You can sign in now.');
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-console-muted">Set password</p>
      <h1 className="mt-2 text-3xl font-semibold text-console-text">Choose a new password</h1>
      <p className="mt-2 text-sm leading-7 text-console-muted">This updates the password associated with the reset token in your email.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input placeholder="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full" />
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <button className="console-button-primary w-full px-5 py-3 text-sm font-semibold">Update password</button>
      </form>
      <div className="mt-6 text-sm text-console-muted">
        <Link to="/login" className="font-semibold text-console-blue">Back to sign in</Link>
      </div>
    </div>
  );
}

