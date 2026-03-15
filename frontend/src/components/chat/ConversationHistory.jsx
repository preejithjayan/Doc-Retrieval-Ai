import { groupByDate } from '../../lib/utils/format';

export default function ConversationHistory({ items, activeConversationId, onSelect }) {
  const grouped = groupByDate(items, 'timestamp');

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, group]) => (
        <div key={date}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{date}</p>
          <div className="mt-3 space-y-2">
            {group.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.conversation_id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  activeConversationId === item.conversation_id
                    ? 'border-cyan-400/30 bg-cyan-400/8'
                    : 'border-white/6 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <p className="line-clamp-2 text-sm font-medium text-[var(--text-primary)]">{item.query}</p>
                <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  <span>{item.model_name || 'Unknown model'}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

