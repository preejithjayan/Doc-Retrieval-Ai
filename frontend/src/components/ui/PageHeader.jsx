import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, title, description, actions, meta }) {
  return (
    <section className="panel-frame rounded-[30px] px-6 py-6 lg:px-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--text-muted)]">{eyebrow}</p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] lg:text-4xl">
            {title}
          </motion.h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-secondary)]">{description}</p>
          {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

