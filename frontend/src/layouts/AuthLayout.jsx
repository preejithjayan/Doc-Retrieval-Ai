import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function AuthLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-console-bg text-console-muted">Loading session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-console-bg px-4 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-2xl border border-console-border bg-white shadow-panel lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-console-dark px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Application Console</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">Operate document retrieval the way an enterprise team expects.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Manage OCR processing, chunk generation, embeddings, semantic search, model routing, and RBAC from one operational console.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-[#0f1318] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pipeline</p>
              <p className="mt-2 text-sm text-white">Upload to OCR to Chunk to Embed to Retrieve to Answer</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0f1318] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Access</p>
              <p className="mt-2 text-sm text-white">Admin, Manager, Analyst, Viewer</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-5 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}

