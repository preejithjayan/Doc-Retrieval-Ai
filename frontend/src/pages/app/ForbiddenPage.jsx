import { AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="panel-frame flex min-h-[60vh] flex-col items-center justify-center rounded-[30px] px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-400">
        <AlertOctagon size={28} />
      </div>
      <h2 className="mt-5 text-3xl font-semibold text-[var(--text-primary)]">Access denied</h2>
      <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
        Your current role does not have permission to access this area. Return to a permitted workspace view or contact an administrator.
      </p>
      <Link to="/dashboard" className="primary-button mt-6 px-5 py-3 text-sm font-semibold">
        Return to dashboard
      </Link>
    </div>
  );
}

