import { AlertTriangle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import AuthPanel from '../../components/auth/AuthPanel';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/authStore';
import { ensureAuthPayload, getApiErrorMessage } from '../../utils/apiErrors';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must contain at least 8 characters.'),
  remember: z.boolean().default(true),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await authApi.login({ email: payload.email, password: payload.password });
      return { ...ensureAuthPayload(data), remember: payload.remember };
    },
    onSuccess: (data) => {
      login({ user: data.user, access: data.access, refresh: data.refresh, remember: data.remember });
      toast.success('Signed in successfully.');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to sign in with those credentials.'));
    },
  });

  return (
    <AuthPanel
      eyebrow="Sign In"
      title="Enter the retrieval workspace"
      description="Authenticate with JWT credentials and resume your document, search, and chat operations."
      footer={<span>Need a new account? <Link to="/register" className="link-inline">Create one</Link></span>}
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="form-label">Email</label>
          <input {...register('email')} type="email" placeholder="operator@workspace.ai" />
          {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="form-label">Password</label>
          <input {...register('password')} type="password" placeholder="Enter your password" />
          {errors.password ? <p className="form-error">{errors.password.message}</p> : null}
        </div>
        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <input {...register('remember')} type="checkbox" className="h-4 w-4 rounded border-[var(--border-subtle)] bg-transparent" />
            Remember me on this machine
          </label>
          <Link to="/forgot-password" className="link-inline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={mutation.isPending} className="primary-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-60">
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {mutation.isError ? (
        <div className="inline-alert mt-4">
          <AlertTriangle size={16} />
          <span>{getApiErrorMessage(mutation.error, 'Check your email and password, then try again.')}</span>
        </div>
      ) : null}
    </AuthPanel>
  );
}

