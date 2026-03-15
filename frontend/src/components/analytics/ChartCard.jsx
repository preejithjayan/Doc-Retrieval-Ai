import { motion } from 'framer-motion';

import { useTilt } from '../../hooks/useTilt';

export default function ChartCard({ title, subtitle, children }) {
  const tiltProps = useTilt();

  return (
    <motion.section
      className="glass-card neural-outline rounded-[30px] p-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.42 }}
      {...tiltProps}
    >
      <div className="mb-5">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
    </motion.section>
  );
}
