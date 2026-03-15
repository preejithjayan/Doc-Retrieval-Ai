import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getApiErrorMessage } from '../utils/apiErrors';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(form);
      toast.success('Signed in successfully.');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      setShake(true);
      window.setTimeout(() => setShake(false), 350);
      toast.error(getApiErrorMessage(error, 'Unable to sign in with those credentials.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.form
        className="glass-panel neural-outline w-full max-w-md rounded-[34px] p-8"
        animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
        onSubmit={handleSubmit}
      >
        <p className="font-mono text-xs uppercase tracking-[0.38em] text-cyan/70">Welcome Back</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Sign in to your neural workspace.</h1>

        <div className="mt-8 grid gap-5">
          <div className="relative">
            <input
              className="floating-field"
              placeholder=" "
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              aria-label="Email"
              required
            />
            <label className="floating-label">Email</label>
          </div>
          <div className="relative">
            <input
              className="floating-field"
              placeholder=" "
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              aria-label="Password"
              required
            />
            <label className="floating-label">Password</label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Link to="/password-reset" className="text-sm text-cyan/80 hover:text-cyan">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="mt-8 w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="text-cyan/80 hover:text-cyan">
            Create one
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
