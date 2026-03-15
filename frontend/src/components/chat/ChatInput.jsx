import { SendHorizonal } from 'lucide-react';
import { useEffect, useRef } from 'react';

import Button from '../ui/Button';

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isSending,
  documents,
  selectedDocumentId,
  onDocumentChange,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <form
      className="glass-panel neural-outline rounded-[30px] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
        <textarea
          ref={textareaRef}
          aria-label="Ask a question"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={1}
          placeholder="Ask a question about your indexed knowledge..."
        />
        <select value={selectedDocumentId} onChange={(event) => onDocumentChange(event.target.value)} aria-label="Select a document context">
          <option value="">All documents</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.file_name}
            </option>
          ))}
        </select>
        <Button type="submit" className="justify-center" disabled={isSending || !value.trim()}>
          {isSending ? 'Sending...' : 'Send'}
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
