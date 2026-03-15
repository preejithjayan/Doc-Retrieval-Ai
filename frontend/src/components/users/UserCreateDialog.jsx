import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { usersApi } from '../../lib/api/users';
import Modal from '../ui/Modal';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  first_name: z.string().min(2, 'Enter a first name.'),
  last_name: z.string().min(2, 'Enter a last name.'),
  password: z.string().min(8, 'Password must contain at least 8 characters.'),
  role_code: z.enum(['ADMIN', 'MANAGER', 'ANALYST', 'VIEWER']),
});

export default function UserCreateDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role_code: 'VIEWER',
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await usersApi.create(payload);
      return data;
    },
    onSuccess: () => {
      toast.success('User created successfully.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset();
      onClose();
    },
    onError: () => {
      toast.error('Unable to create user.');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Create user" description="Provision a new workspace account with a role and temporary password." width="max-w-xl">
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="form-label">Email</label>
          <input {...register('email')} type="email" placeholder="user@workspace.ai" />
          {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">First name</label>
            <input {...register('first_name')} />
            {errors.first_name ? <p className="form-error">{errors.first_name.message}</p> : null}
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input {...register('last_name')} />
            {errors.last_name ? <p className="form-error">{errors.last_name.message}</p> : null}
          </div>
        </div>
        <div>
          <label className="form-label">Temporary password</label>
          <input {...register('password')} type="password" />
          {errors.password ? <p className="form-error">{errors.password.message}</p> : null}
        </div>
        <div>
          <label className="form-label">Role</label>
          <select {...register('role_code')}>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ANALYST">ANALYST</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => { reset(); onClose(); }} className="secondary-button px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="primary-button px-4 py-2 text-sm font-semibold disabled:opacity-60">
            {mutation.isPending ? 'Creating...' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

