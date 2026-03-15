import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--panel)] shadow-[0_24px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_20%),linear-gradient(180deg,#0b1117_0%,#090d12_100%)] px-8 py-10 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyan-300/80">Document Retrieval AI</p>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight text-white lg:text-5xl">
              Retrieval operations for teams that live in documents, evidence, and traceable answers.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-300">
              Upload and process dense source material, route prompts across models, inspect citations, and manage workspace access from one dark industrial console.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">Pipeline</p>
                <p className="mt-3 text-sm text-white">OCR / Chunking / Embeddings / Vector Search / Cited Answers</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">Roles</p>
                <p className="mt-3 text-sm text-white">ADMIN, MANAGER, ANALYST, VIEWER with protected routing</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}


