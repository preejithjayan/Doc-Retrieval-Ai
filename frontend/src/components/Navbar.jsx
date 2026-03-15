import { BellDot, LogOut, Search } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

export default function Navbar({ user }) {
  const { logout } = useAuth();

  return (
    <header className="rounded-xl border border-black/40 bg-console-dark px-5 py-4 text-white shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Application Console</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-white">Doc Retrieval AI</h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              Document Ingestion and Chat Operations
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 xl:max-w-2xl xl:flex-row xl:items-center xl:justify-end">
          <div className="relative min-w-0 flex-1 xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              readOnly
              value="Quick search is available inside Semantic Search and Chatbot modules"
              className="w-full cursor-default border border-slate-700 bg-[#0f1318] pl-9 text-sm text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0f1318] px-3 py-2 text-sm text-slate-300">
              <BellDot size={16} />
              <span>Production</span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-[#0f1318] px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Signed in</p>
              <p className="text-sm font-semibold text-white">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0f1318] px-4 py-2 text-sm font-semibold text-white hover:border-slate-500 hover:bg-[#1b2028]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

