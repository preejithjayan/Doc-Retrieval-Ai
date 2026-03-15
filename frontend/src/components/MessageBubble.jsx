export default function MessageBubble({ message, role = 'assistant' }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-4xl rounded-lg border px-4 py-3 text-sm leading-7 ${
          isUser
            ? 'border-blue-200 bg-blue-50 text-console-text'
            : 'border-console-border bg-white text-console-text'
        }`}
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-console-muted">
          {isUser ? 'Operator Input' : 'Assistant Response'}
        </p>
        <div className="whitespace-pre-wrap">{message}</div>
      </div>
    </div>
  );
}

