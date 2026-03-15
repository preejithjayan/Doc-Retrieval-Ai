import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import AuthPanel from '../../components/auth/AuthPanel';
import { authApi } from '../../lib/api/auth';

const schema = z
  .object({
    new_password: z.string().min(8, 'Password must contain at least 8 characters.'),
    confirm_password: z.string().min(8, 'Confirm the new password.'),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords must match.',
  });

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { confirm_password, ...body } = payload;
      const { data } = await authApi.resetPassword({
        uid: params.get('uid'),
        token: params.get('token'),
        ...body,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password updated.');
    },
    onError: () => {
      toast.error('Unable to reset password with this token.');
    },
  });

  return (
    <AuthPanel
      eyebrow="Reset Password"
      title="Choose a new password"
      description="Use the token in your email to set a new password for your operator account."
      footer={<span>Back to <Link to="/login" className="link-inline">sign in</Link></span>}
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="form-label">New password</label>
          <input {...register('new_password')} type="password" placeholder="Enter a new password" />
          {errors.new_password ? <p className="form-error">{errors.new_password.message}</p> : null}
        </div>
        <div>
          <label className="form-label">Confirm password</label>
          <input {...register('confirm_password')} type="password" placeholder="Repeat the new password" />
          {errors.confirm_password ? <p className="form-error">{errors.confirm_password.message}</p> : null}
        </div>
        <button type="submit" disabled={mutation.isPending} className="primary-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-60">
          {mutation.isPending ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </AuthPanel>
  );
}

