import Badge from './Badge';

export default function MetricCard({ label, value, hint, tone = 'accent' }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{label}</p>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <p className="mt-5 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{hint}</p>
    </div>
  );
}

