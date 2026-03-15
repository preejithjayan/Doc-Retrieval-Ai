import { ChevronRight } from 'lucide-react';

import { formatRelativeSectionLabel } from '../../utils/formatDate';
import { truncate } from '../../utils/truncate';
import Button from '../ui/Button';

export default function ChatHistory({
  groupedHistory,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onLoadMore,
  hasNextPage,
  isLoadingMore,
}) {
  return (
    <aside className="glass-card neural-outline scrollbar-thin flex h-full flex-col rounded-[30px] p-4">
      <Button type="button" className="w-full justify-center" onClick={onNewChat}>
        New Chat
      </Button>

      <div className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
        {groupedHistory.map((section) => (
          <div key={section.label}>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.32em] text-slate-500">
              {formatRelativeSectionLabel(section.label)}
            </p>
            <div className="grid gap-2">
              {section.items.map((conversation) => (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  className={`rounded-[22px] border px-4 py-3 text-left transition ${
                    selectedConversationId === conversation.conversation_id
                      ? 'border-cyan/30 bg-cyan/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{truncate(conversation.query, 34)}</p>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{truncate(conversation.response, 64)}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasNextPage ? (
        <Button type="button" variant="secondary" className="mt-4 justify-center" onClick={onLoadMore} disabled={isLoadingMore}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </Button>
      ) : null}
    </aside>
  );
}
