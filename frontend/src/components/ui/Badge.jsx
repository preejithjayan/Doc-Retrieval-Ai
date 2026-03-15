const toneClasses = {
  default: 'border-white/10 bg-white/5 text-slate-200',
  success: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
  danger: 'border-rose-400/25 bg-rose-500/10 text-rose-200',
  info: 'border-cyan/25 bg-cyan/10 text-cyan-100',
  admin: 'border-rose-400/25 bg-rose-500/10 text-rose-200',
  manager: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
  analyst: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
  viewer: 'border-slate-400/20 bg-slate-500/10 text-slate-200',
};

export default function Badge({ children, tone = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] ${toneClasses[tone] ?? toneClasses.default} ${className}`}
    >
      {children}
    </span>
  );
}
