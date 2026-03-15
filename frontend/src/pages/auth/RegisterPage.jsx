import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import AuthPanel from '../../components/auth/AuthPanel';
import { authApi } from '../../lib/api/auth';
import { getApiErrorMessage } from '../../utils/apiErrors';

const schema = z
  .object({
    first_name: z.string().min(2, 'Enter a first name.'),
    last_name: z.string().min(2, 'Enter a last name.'),
    email: z.string().email('Enter a valid email address.'),
    requested_role: z.enum(['VIEWER', 'ANALYST', 'MANAGER']),
    password: z.string().min(8, 'Password must contain at least 8 characters.'),
    confirm_password: z.string().min(8, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords must match.',
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      requested_role: 'VIEWER',
      password: '',
      confirm_password: '',
    },
  });

  const requestedRole = watch('requested_role');

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { requested_role, ...body } = payload;
      const { data } = await authApi.register(body);
      return { data, requestedRole: requested_role };
    },
    onSuccess: ({ requestedRole }) => {
      if (requestedRole !== 'VIEWER') {
        toast.success('Account created. Higher access levels require admin approval and start as VIEWER.');
      } else {
        toast.success('Account created successfully.');
      }
      navigate('/login');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create the account.'));
    },
  });

  return (
    <AuthPanel
      eyebrow="Register"
      title="Create a new operator account"
      description="Start a new workspace session. Elevated roles are captured as requested access and require administrator approval."
      footer={<span>Already have an account? <Link to="/login" className="link-inline">Sign in</Link></span>}
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">First name</label>
            <input {...register('first_name')} placeholder="Ada" />
            {errors.first_name ? <p className="form-error">{errors.first_name.message}</p> : null}
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input {...register('last_name')} placeholder="Lovelace" />
            {errors.last_name ? <p className="form-error">{errors.last_name.message}</p> : null}
          </div>
        </div>
        <div>
          <label className="form-label">Email</label>
          <input {...register('email')} type="email" placeholder="analyst@workspace.ai" />
          {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="form-label">Requested access</label>
          <select {...register('requested_role')}>
            <option value="VIEWER">VIEWER</option>
            <option value="ANALYST">ANALYST</option>
            <option value="MANAGER">MANAGER</option>
          </select>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {requestedRole === 'VIEWER'
              ? 'Viewer accounts can search indexed content and use the chatbot.'
              : 'Requested elevated access is noted in the sign-up flow but requires administrator approval after registration.'}
          </p>
        </div>
        <div>
          <label className="form-label">Password</label>
          <input {...register('password')} type="password" placeholder="Create a strong password" />
          {errors.password ? <p className="form-error">{errors.password.message}</p> : null}
        </div>
        <div>
          <label className="form-label">Confirm password</label>
          <input {...register('confirm_password')} type="password" placeholder="Confirm password" />
          {errors.confirm_password ? <p className="form-error">{errors.confirm_password.message}</p> : null}
        </div>
        <button type="submit" disabled={mutation.isPending} className="primary-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-60">
          {mutation.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthPanel>
  );
}

