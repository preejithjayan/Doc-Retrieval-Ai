import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import UserCreateDialog from '../../components/users/UserCreateDialog';
import RoleBadge from '../../components/users/RoleBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { formatDateTime } from '../../lib/utils/format';
import { usersApi } from '../../lib/api/users';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await usersApi.list({ page_size: 50 });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await usersApi.update(id, payload);
      return data;
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old) => {
        if (!old?.results) return old;
        return {
          ...old,
          results: old.results.map((item) =>
            item.id === id
              ? {
                  ...item,
                  role: {
                    ...item.role,
                    code: payload.role_code,
                  },
                  role_code: payload.role_code,
                  is_active: payload.is_active,
                }
              : item,
          ),
        };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['users'], context.previous);
      }
      toast.error('Unable to update user role.');
    },
    onSuccess: () => {
      toast.success('User updated.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await usersApi.remove(id);
      return id;
    },
    onSuccess: () => {
      toast.success('User deleted.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Unable to delete user.');
    },
  });

  const results = usersQuery.data?.results || [];

  return (
    <>
      <UserCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete user"
        description={`Remove ${deleteTarget?.email || 'this user'} from the workspace.`}
        confirmLabel="Delete user"
      />

      <div className="space-y-6">
        <PageHeader
          eyebrow="Users"
          title="User administration"
          description="Manage operator accounts, update access roles inline, and remove users from the workspace with explicit confirmation."
          actions={
            <button type="button" onClick={() => setCreateOpen(true)} className="primary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <Plus size={16} />
              Create user
            </button>
          }
        />

        <section className="panel-frame overflow-hidden rounded-[30px]">
          <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-[var(--border-subtle)] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Date joined</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-white/6">
            {usersQuery.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 px-5 py-5">
                  {Array.from({ length: 6 }).map((__, cell) => <Skeleton key={cell} className="h-14 w-full" />)}
                </div>
              ))
            ) : results.length ? (
              results.map((user) => (
                <div key={user.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 px-5 py-5">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{user.first_name} {user.last_name}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{user.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                  <div>
                    <select
                      value={user.role?.code || user.role_code}
                      onChange={(event) =>
                        updateMutation.mutate({
                          id: user.id,
                          payload: {
                            email: user.email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            role_code: event.target.value,
                            is_active: user.is_active,
                          },
                        })
                      }
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <div className="mt-2"><RoleBadge role={user.role?.code || user.role_code} /></div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{formatDateTime(user.created_at)}</div>
                  <div>{user.is_active ? <RoleBadge role="ACTIVE" /> : <RoleBadge role="INACTIVE" />}</div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setDeleteTarget(user)} className="danger-button inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold">
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12">
                <EmptyState title="No users found" description="Create the first user to begin assigning roles and access levels." />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
