export default function AuthPanel({ eyebrow, title, description, children, footer }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--text-muted)]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-8 space-y-4">{children}</div>
      {footer ? <div className="mt-6 text-sm text-[var(--text-secondary)]">{footer}</div> : null}
    </div>
  );
}

