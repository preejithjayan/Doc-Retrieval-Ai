import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import * as authApi from '../api/authApi';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getApiErrorMessage } from '../utils/apiErrors';
import { splitFullName } from '../utils/name';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  return score;
}

export default function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { firstName, lastName } = splitFullName(form.fullName);
      await authApi.register({
        first_name: firstName,
        last_name: lastName,
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
      });
      await signIn({
        email: form.email,
        password: form.password,
      });
      toast.success('Account created.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create account.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.form className="glass-panel neural-outline w-full max-w-lg rounded-[34px] p-8" onSubmit={handleSubmit}>
        <p className="font-mono text-xs uppercase tracking-[0.38em] text-cyan/70">Create Account</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Launch your document intelligence workspace.</h1>

        <div className="mt-8 grid gap-5">
          {[
            { key: 'fullName', label: 'Full Name', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'password', label: 'Password', type: 'password' },
            { key: 'confirmPassword', label: 'Confirm Password', type: 'password' },
          ].map((field) => (
            <div key={field.key} className="relative">
              <input
                className="floating-field"
                placeholder=" "
                type={field.type}
                value={form[field.key]}
                onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                aria-label={field.label}
                required
              />
              <label className="floating-label">{field.label}</label>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <div
              className={`h-full rounded-full transition-all ${
                strength < 50 ? 'bg-rose-500' : strength < 75 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan to-violet'
              }`}
              style={{ width: `${strength}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">Password strength: {strength < 50 ? 'Weak' : strength < 75 ? 'Good' : 'Strong'}</p>
        </div>

        <Button type="submit" className="mt-8 w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan/80 hover:text-cyan">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
