import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import * as authApi from '../api/authApi';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';

export default function PasswordResetConfirm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    uid: searchParams.get('uid') || '',
    token: searchParams.get('token') || '',
    newPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await authApi.confirmPasswordReset({
        uid: form.uid,
        token: form.token,
        new_password: form.newPassword,
      });
      toast.success('Password updated successfully.');
      navigate('/login', { replace: true });
    } catch {
      toast.error('That reset link is invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.form className="glass-panel neural-outline w-full max-w-lg rounded-[34px] p-8" onSubmit={handleSubmit}>
        <div className="mb-8 flex items-center gap-3">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${step === 2 ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/10 bg-white/5 text-slate-500'}`}>
                {step}
              </div>
              {step < 2 ? <div className="h-px w-16 bg-white/10" /> : null}
            </div>
          ))}
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.38em] text-cyan/70">Password Reset</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Step 2: confirm and set a new password.</h1>

        <div className="mt-8 grid gap-5">
          <div className="relative">
            <input className="floating-field" placeholder=" " value={form.uid} onChange={(event) => setForm((current) => ({ ...current, uid: event.target.value }))} aria-label="Reset UID" required />
            <label className="floating-label">Reset UID</label>
          </div>
          <div className="relative">
            <input className="floating-field" placeholder=" " value={form.token} onChange={(event) => setForm((current) => ({ ...current, token: event.target.value }))} aria-label="Reset token" required />
            <label className="floating-label">Reset Token</label>
          </div>
          <div className="relative">
            <input className="floating-field" placeholder=" " type="password" value={form.newPassword} onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))} aria-label="New password" required />
            <label className="floating-label">New Password</label>
          </div>
        </div>

        <Button type="submit" className="mt-8 w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Back to{' '}
          <Link to="/login" className="text-cyan/80 hover:text-cyan">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
