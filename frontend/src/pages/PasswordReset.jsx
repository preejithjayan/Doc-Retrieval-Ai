import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import * as authApi from '../api/authApi';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';

export default function PasswordReset() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await authApi.requestPasswordReset({ email });
      setIsDone(true);
      toast.success('Reset instructions sent if the account exists.');
    } catch {
      toast.error('Unable to send reset instructions right now.');
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
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${step === 1 ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/10 bg-white/5 text-slate-500'}`}>
                {step}
              </div>
              {step < 2 ? <div className="h-px w-16 bg-white/10" /> : null}
            </div>
          ))}
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.38em] text-cyan/70">Password Reset</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Step 1: request a secure reset link.</h1>

        <div className="mt-8 relative">
          <input className="floating-field" placeholder=" " type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email" required />
          <label className="floating-label">Email</label>
        </div>

        {isDone ? (
          <div className="mt-5 rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            If that email exists, we sent a link for step two. Open it to confirm your new password.
          </div>
        ) : null}

        <Button type="submit" className="mt-8 w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered it?{' '}
          <Link to="/login" className="text-cyan/80 hover:text-cyan">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
