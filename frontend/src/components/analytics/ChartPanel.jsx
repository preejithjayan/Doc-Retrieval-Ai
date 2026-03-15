export default function ChartPanel({ title, description, children }) {
  return (
    <section className="panel-frame rounded-[28px] px-5 py-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        {description ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p> : null}
      </div>
      <div className="mt-5 h-[320px]">{children}</div>
    </section>
  );
}

