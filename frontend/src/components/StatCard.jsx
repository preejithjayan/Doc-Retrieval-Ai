export default function StatCard({ eyebrow, value, detail, tone = 'blue' }) {
  const toneClasses = {
    blue: 'border-t-console-blue',
    orange: 'border-t-console-orange',
    neutral: 'border-t-slate-500',
    success: 'border-t-emerald-600',
  };

  return (
    <div className={`panel-muted border-t-4 p-5 ${toneClasses[tone] || toneClasses.blue}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-console-muted">{eyebrow}</p>
      <p className="mt-3 text-3xl font-semibold text-console-text">{value}</p>
      <p className="mt-2 text-sm text-console-muted">{detail}</p>
    </div>
  );
}

