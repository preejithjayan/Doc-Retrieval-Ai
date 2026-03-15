export default function EmptyState({ title, description, action }) {
  return (
    <div className="glass-card neural-outline rounded-[28px] p-10 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-cyan/20 bg-cyan/10">
        <div className="grid gap-2">
          <span className="mx-auto h-2 w-12 rounded-full bg-cyan/60" />
          <span className="mx-auto h-2 w-8 rounded-full bg-violet/60" />
          <span className="mx-auto h-10 w-14 rounded-2xl border border-white/15 bg-white/5" />
        </div>
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
