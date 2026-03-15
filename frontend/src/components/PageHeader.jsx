export default function PageHeader({ eyebrow, title, description, actions, details = [] }) {
  return (
    <section className="panel px-6 py-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-console-muted">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold text-console-text">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-console-muted">{description}</p>
          {details.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {details.map((detail) => (
                <span key={detail} className="rounded-full border border-console-border bg-slate-50 px-3 py-1 text-xs font-semibold text-console-muted">
                  {detail}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

