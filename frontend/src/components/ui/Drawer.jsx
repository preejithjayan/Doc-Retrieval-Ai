import { AnimatePresence, motion } from 'framer-motion';

export default function Drawer({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="absolute right-0 top-0 h-full w-full max-w-2xl border-l border-[var(--border-subtle)] bg-[var(--panel)] shadow-[0_12px_60px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[var(--border-subtle)] px-6 py-5">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
            </div>
            <div className="h-[calc(100%-85px)] overflow-y-auto px-6 py-5">{children}</div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

