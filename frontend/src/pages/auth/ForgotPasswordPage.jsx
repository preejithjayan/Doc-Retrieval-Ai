import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import AuthPanel from '../../components/auth/AuthPanel';
import { authApi } from '../../lib/api/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await authApi.forgotPassword(payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Reset email sent.');
    },
    onError: () => {
      toast.error('Unable to send reset email.');
    },
  });

  return (
    <AuthPanel
      eyebrow="Forgot Password"
      title="Send a password reset email"
      description="Submit the email address associated with your operator account to receive a reset link."
      footer={<span>Remembered your credentials? <Link to="/login" className="link-inline">Return to sign in</Link></span>}
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="form-label">Email</label>
          <input {...register('email')} type="email" placeholder="operator@workspace.ai" />
          {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
        </div>
        <button type="submit" disabled={mutation.isPending} className="primary-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-60">
          {mutation.isPending ? 'Sending...' : 'Send reset email'}
        </button>
      </form>
    </AuthPanel>
  );
}

