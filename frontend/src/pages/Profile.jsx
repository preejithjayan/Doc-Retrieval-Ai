import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { getProfile, updateProfile } from '../api/usersApi';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatDate';
import { getTokenExpiry } from '../utils/jwt';
import { splitFullName } from '../utils/name';

export default function Profile() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { accessToken, signOut, refreshUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', password: '' });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setForm({
      fullName: profileQuery.data.full_name || [profileQuery.data.first_name, profileQuery.data.last_name].filter(Boolean).join(' '),
      password: '',
    });
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: async () => {
      toast.success('Profile updated.');
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Unable to update your profile.');
    },
  });

  const tokenExpiry = useMemo(() => getTokenExpiry(accessToken), [accessToken]);
  const profile = profileQuery.data;
  const initials = profile?.full_name?.slice(0, 2).toUpperCase() || profile?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <PageWrapper>
      <section className="mx-auto max-w-6xl">
        {profileQuery.isLoading ? (
          <Skeleton className="h-[520px] rounded-[32px]" />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-card neural-outline rounded-[32px] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan/20 to-violet/30 font-mono text-2xl">
                  {initials}
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold">{profile.full_name || profile.email}</p>
                  <p className="mt-2 text-sm text-slate-400">{profile.role_code}</p>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan/70">Session Info</p>
                <div className="mt-4 grid gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Last login</p>
                    <p className="mt-1 text-white">{formatDate(profile.last_login, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">JWT expiry</p>
                    <p className="mt-1 text-white">{tokenExpiry ? formatDate(tokenExpiry, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unavailable'}</p>
                  </div>
                </div>
              </div>

              <Button type="button" variant="secondary" className="mt-6" onClick={signOut}>
                Sign Out
              </Button>
            </div>

            <div className="glass-card neural-outline rounded-[32px] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Profile Settings</p>
              <h1 className="mt-4 font-display text-4xl font-semibold">Manage your identity and credentials.</h1>

              <div className="mt-8 grid gap-5">
                <div className="relative">
                  <input className="floating-field" placeholder=" " value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
                  <label className="floating-label">Display Name</label>
                </div>
                <div className="relative">
                  <input className="floating-field" placeholder=" " value={profile.email} readOnly />
                  <label className="floating-label">Email</label>
                </div>
                <div className="relative">
                  <input className="floating-field" placeholder=" " type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
                  <label className="floating-label">Change Password</label>
                </div>
              </div>

              <Button
                type="button"
                className="mt-8"
                disabled={updateMutation.isPending}
                onClick={() => {
                  const { firstName, lastName } = splitFullName(form.fullName);
                  updateMutation.mutate({
                    first_name: firstName,
                    last_name: lastName,
                    ...(form.password ? { password: form.password } : {}),
                  });
                }}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
