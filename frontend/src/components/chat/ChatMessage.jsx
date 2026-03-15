import { motion } from 'framer-motion';

import { formatDate } from '../../utils/formatDate';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-3xl rounded-[28px] px-5 py-4 ${
          isUser
            ? 'border border-cyan/30 bg-cyan/10 text-cyan-50'
            : 'glass-card neural-outline text-slate-100'
        }`}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
        {!isUser && message.citations?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.citations.map((citation, index) => (
              <span
                key={`${citation.document_id || citation.file_name}-${index}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
              >
                {citation.file_name} • {citation.reference || `Chunk ${(citation.chunk_index ?? 0) + 1}`}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-3 text-right text-xs text-slate-500">{formatDate(message.timestamp, { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>
    </motion.div>
  );
}
