import { useEffect, useState } from 'react';

import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';

const initialForm = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role_code: 'VIEWER',
  is_active: true,
};

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadUsers = async () => {
    const { data } = await userService.list();
    setUsers(data.results || data || []);
  };

  useEffect(() => {
    if (user?.role_code === 'ADMIN') {
      loadUsers();
    }
  }, [user?.role_code]);

  if (user?.role_code !== 'ADMIN') {
    return <div className="panel px-6 py-5 text-sm text-console-muted">User management is available to admins only.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="User Management"
        title="Access and role administration"
        description="Create, review, and remove users while enforcing role-based access rules across the document retrieval platform."
        details={['Admin only', 'Role assignment', 'Temporary passwords', 'RBAC operations']}
      />

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="panel px-6 py-5">
          <p className="text-sm font-semibold text-console-text">Create user</p>
          <p className="mt-1 text-xs text-console-muted">Provision a user with an initial role and temporary password.</p>
          <form
            className="mt-5 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              await userService.create(form);
              setForm(initialForm);
              await loadUsers();
            }}
          >
            <input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full" />
            <div className="grid gap-3 md:grid-cols-2">
              <input placeholder="First name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} className="w-full" />
              <input placeholder="Last name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} className="w-full" />
            </div>
            <input placeholder="Temporary password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full" />
            <select value={form.role_code} onChange={(event) => setForm({ ...form, role_code: event.target.value })} className="w-full">
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ANALYST">ANALYST</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <button className="console-button-primary w-full px-5 py-3 text-sm font-semibold">Create user</button>
          </form>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-console-border bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-console-text">User directory</p>
            <p className="mt-1 text-xs text-console-muted">Review current access assignments and remove obsolete accounts.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {users.map((member) => (
              <div key={member.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-console-text">{member.email}</p>
                  <p className="mt-1 text-xs text-console-muted">{member.first_name} {member.last_name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tag-muted">{member.role?.code || member.role_code}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await userService.remove(member.id);
                      await loadUsers();
                    }}
                    className="console-button-danger px-3 py-2 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!users.length && <div className="px-5 py-8 text-sm text-console-muted">No users found yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

