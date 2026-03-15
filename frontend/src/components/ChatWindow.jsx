import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages }) {
  return (
    <div className="panel flex h-[62vh] flex-col overflow-hidden">
      <div className="border-b border-console-border bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-console-text">Conversation Stream</p>
        <p className="mt-1 text-xs text-console-muted">Responses are grounded in the highest scoring retrieved chunks.</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#fafbfc] p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-console-muted">
            Submit a question to retrieve evidence-backed answers with citations.
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message.message} role={message.role} />)
        )}
      </div>
    </div>
  );
}

