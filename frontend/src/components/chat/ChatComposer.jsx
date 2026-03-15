import { Paperclip, SendHorizonal } from 'lucide-react';

export default function ChatComposer({ value, onChange, onSubmit, disabled }) {
  return (
    <form onSubmit={onSubmit} className="panel-frame rounded-[26px] px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--text-muted)]">Message</p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 rounded-[22px] border border-white/8 bg-black/12 px-4 py-3">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSubmit(event);
              }
            }}
            rows={4}
            placeholder="Ask grounded questions about uploaded documents. Press Enter to send, Shift+Enter for a new line."
            className="min-h-[120px] w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-8 shadow-none focus:border-0 focus:shadow-none"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Paperclip size={14} />
              File attachments can be added in a future streaming upgrade.
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Enter to send</span>
          </div>
        </div>
        <button type="submit" disabled={disabled} className="primary-button inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold disabled:opacity-60">
          <SendHorizonal size={16} />
          Send
        </button>
      </div>
    </form>
  );
}
