import { Trash2 } from 'lucide-react';

import { formatDate } from '../../utils/formatDate';
import Badge from '../ui/Badge';

const toneMap = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
};

export default function UserTable({ users, onRoleChange, onDelete }) {
  return (
    <div className="glass-card neural-outline overflow-hidden rounded-[30px]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.28em] text-slate-500">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/10">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan/20 to-violet/30 font-mono text-sm">
                      {user.full_name?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.full_name || user.email}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Badge tone={toneMap[user.role?.code] || 'default'}>{user.role?.code}</Badge>
                    <select
                      className="max-w-[150px]"
                      value={user.role?.code || 'VIEWER'}
                      onChange={(event) => onRoleChange(user, event.target.value)}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-400">{formatDate(user.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
