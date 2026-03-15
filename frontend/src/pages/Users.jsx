import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { createUser, deleteUser, getUsers, updateUser } from '../api/usersApi';
import PageWrapper from '../components/layout/PageWrapper';
import UserTable from '../components/users/UserTable';
import UserModal from '../components/users/UserModal';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import { splitFullName } from '../utils/name';

export default function Users() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const usersQuery = useQuery({
    queryKey: ['users', { page, role, search: debouncedSearch }],
    queryFn: () => getUsers({ page, pageSize: 15, role, search: debouncedSearch }),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createUser(payload),
    onSuccess: () => {
      toast.success('User created.');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Unable to create that user.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success('User updated.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Unable to update that user.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Unable to delete that user.');
    },
  });

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">User Management</p>
            <h1 className="mt-4 font-display text-4xl font-semibold">Control access across every role tier.</h1>
          </div>
          <Button type="button" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <select
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ANALYST">ANALYST</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <div className="mt-8">
          {usersQuery.isLoading ? (
            <Skeleton className="h-[420px] rounded-[30px]" />
          ) : (
            <UserTable
              users={usersQuery.data?.results || []}
              onRoleChange={(user, roleCode) =>
                updateMutation.mutate({
                  id: user.id,
                  payload: {
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    is_active: user.is_active,
                    role_code: roleCode,
                  },
                })
              }
              onDelete={setDeleteTarget}
            />
          )}
        </div>

        {usersQuery.data?.count ? (
          <div className="mt-8">
            <Pagination page={page} pageSize={15} count={usersQuery.data.count} onPageChange={setPage} />
          </div>
        ) : null}

        <UserModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          isSubmitting={createMutation.isPending}
          onSubmit={(form) => {
            const { firstName, lastName } = splitFullName(form.fullName);
            createMutation.mutate({
              email: form.email,
              first_name: firstName,
              last_name: lastName,
              password: form.password,
              role_code: form.roleCode,
            });
          }}
        />

        <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} className="max-w-md">
          <div className="p-6">
            <h3 className="font-display text-2xl font-semibold">Delete this user?</h3>
            <p className="mt-3 text-sm text-slate-400">This removes their access and profile from the platform.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={() => deleteMutation.mutate(deleteTarget.id)}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </section>
    </PageWrapper>
  );
}
