import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useTilt } from '../../hooks/useTilt';

export default function StatCounter({ label, value, suffix, accent = 'cyan' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.35 });
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);
  const tiltProps = useTilt();

  useEffect(() => {
    if (!isInView || typeof value !== 'number') {
      setDisplayValue(value);
      return undefined;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const duration = 900;

    const step = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="glass-card neural-outline rounded-[28px] p-5"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.4 }}
      {...tiltProps}
    >
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <h3 className={`font-display text-3xl font-semibold ${accent === 'violet' ? 'text-violet-200' : 'text-white'}`}>
          {displayValue}
          {suffix ? <span className="ml-1 text-base text-slate-400">{suffix}</span> : null}
        </h3>
        <span className={`h-2 w-16 rounded-full ${accent === 'violet' ? 'bg-violet/70' : 'bg-cyan/70'}`} />
      </div>
    </motion.div>
  );
}
