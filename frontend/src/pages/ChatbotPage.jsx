import { SendHorizonal } from 'lucide-react';
import { useMemo, useState } from 'react';

import ChatWindow from '../components/ChatWindow';
import PageHeader from '../components/PageHeader';
import { useChatHistory } from '../hooks/useChat';
import chatService from '../services/chatService';

export default function ChatbotPage() {
  const { history, setHistory } = useChatHistory();
  const [conversationId, setConversationId] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);

  const historyPreview = useMemo(() => history.slice(0, 12), [history]);

  const submitQuery = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    const userMessage = { id: crypto.randomUUID(), role: 'user', message: query };
    setMessages((current) => [...current, userMessage]);

    const { data } = await chatService.query({ query, conversation_id: conversationId, top_k: 5 });
    setConversationId(data.conversation_id);
    setMessages((current) => [
      ...current,
      {
        id: data.history_id,
        role: 'assistant',
        message: `${data.answer}\n\nCitations:\n${(data.citations || []).map((item) => `- ${item.file_name} chunk ${item.chunk_index}`).join('\n')}`,
      },
    ]);
    setHistory((current) => [{ id: data.history_id, conversation_id: data.conversation_id, query, response: data.answer, citations: data.citations, timestamp: new Date().toISOString() }, ...current]);
    setQuery('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Chatbot"
        title="Evidence-backed assistant conversations"
        description="Ask questions over indexed documents, reuse previous sessions, and inspect the citations that grounded each response."
        details={['Conversation memory', 'Top-5 retrieval', 'Cited responses', 'History replay']}
      />

      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="panel overflow-hidden">
          <div className="border-b border-console-border bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-console-text">Recent sessions</p>
            <p className="mt-1 text-xs text-console-muted">Load prior prompts to continue the same conversation context.</p>
          </div>
          <div className="max-h-[64vh] overflow-y-auto p-4">
            <div className="space-y-3">
              {historyPreview.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-lg border border-console-border bg-white p-4 text-left hover:border-console-blue hover:bg-blue-50/40"
                  onClick={() => {
                    setConversationId(item.conversation_id || '');
                    setMessages([
                      { id: `${item.id}-q`, role: 'user', message: item.query },
                      { id: `${item.id}-a`, role: 'assistant', message: item.response },
                    ]);
                  }}
                >
                  <p className="text-sm font-semibold text-console-text">{item.query}</p>
                  <p className="mt-2 text-xs text-console-muted">{new Date(item.timestamp).toLocaleString()}</p>
                </button>
              ))}
              {!historyPreview.length && <p className="text-sm text-console-muted">No conversation history available yet.</p>}
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <ChatWindow messages={messages} />
          <section className="panel px-5 py-4">
            <p className="text-sm font-semibold text-console-text">Submit a query</p>
            <p className="mt-1 text-xs text-console-muted">The service will retrieve relevant chunks and route the answer through the active model profile.</p>
            <form onSubmit={submitQuery} className="mt-4 flex flex-col gap-3 md:flex-row">
              <textarea
                rows="4"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask a grounded question about the indexed documents..."
                className="min-h-[112px] flex-1 resize-none"
              />
              <button type="submit" className="console-button-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold md:self-end">
                <SendHorizonal size={16} />
                Query chatbot
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

