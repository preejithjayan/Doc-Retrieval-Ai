import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { apiClient } from '../../lib/api/client';
import { usersApi } from '../../lib/api/users';
import { useAuthStore } from '../../stores/authStore';
import { useModelStore } from '../../stores/modelStore';
import { useThemeStore } from '../../stores/themeStore';

const schema = z.object({
  first_name: z.string().min(2, 'Enter a first name.'),
  last_name: z.string().min(2, 'Enter a last name.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().optional().or(z.literal('')),
});

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const currentModel = useModelStore((state) => state.currentModel);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const sessionQuery = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/session');
      return data.user;
    },
  });

  const user = sessionQuery.data || authUser;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
    });
  }, [reset, user]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const body = { ...payload };
      if (!body.password) {
        delete body.password;
      }
      const { data } = await usersApi.updateMe(body);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      toast.success('Profile updated.');
      reset({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        password: '',
      });
    },
    onError: () => {
      toast.error('Unable to update profile settings.');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile and workspace preferences"
        description="Update operator profile details, switch between dark and light themes, and inspect current session and model routing information."
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="panel-frame rounded-[28px] px-6 py-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Edit your visible identity fields and rotate your password when needed.</p>
          {sessionQuery.isLoading ? (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
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
                <label className="form-label">Email</label>
                <input {...register('email')} type="email" />
                {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
              </div>
              <div>
                <label className="form-label">Password</label>
                <input {...register('password')} type="password" placeholder="Leave blank to keep the current password" />
                {errors.password ? <p className="form-error">{errors.password.message}</p> : null}
              </div>
              <button type="submit" disabled={mutation.isPending} className="primary-button px-4 py-3 text-sm font-semibold disabled:opacity-60">
                {mutation.isPending ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          )}
        </section>

        <div className="space-y-4">
          <section className="panel-frame rounded-[28px] px-6 py-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Theme</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Switch between the dark editorial default and a lighter console theme.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setTheme('dark')} className={`${theme === 'dark' ? 'primary-button' : 'secondary-button'} px-4 py-3 text-sm font-semibold`}>
                Dark
              </button>
              <button type="button" onClick={() => setTheme('light')} className={`${theme === 'light' ? 'primary-button' : 'secondary-button'} px-4 py-3 text-sm font-semibold`}>
                Light
              </button>
            </div>
          </section>

          <section className="panel-frame rounded-[28px] px-6 py-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">API session info</h3>
            <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/12 px-4 py-3">
                <span>Current model</span>
                <Badge tone="accent">{currentModel?.model_name || 'Not set'}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/12 px-4 py-3">
                <span>Role</span>
                <Badge tone="default">{user?.role_code || 'Unknown'}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/12 px-4 py-3">
                <span>Session email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/12 px-4 py-3">
                <span>Theme</span>
                <span className="font-mono uppercase tracking-[0.18em]">{theme}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
