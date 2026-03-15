import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getChatHistory, sendChatQuery } from '../api/chatApi';
import { getDocuments } from '../api/documentsApi';
import ChatHistory from '../components/chat/ChatHistory';
import ChatInput from '../components/chat/ChatInput';
import ChatMessage from '../components/chat/ChatMessage';
import TypingIndicator from '../components/chat/TypingIndicator';
import PageWrapper from '../components/layout/PageWrapper';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../hooks/useToast';
import { useUIStore } from '../store/uiStore';

function getNextPageFromUrl(nextUrl) {
  if (!nextUrl) {
    return undefined;
  }

  try {
    return Number(new URL(nextUrl).searchParams.get('page'));
  } catch {
    const search = nextUrl.split('?')[1] || '';
    const page = new URLSearchParams(search).get('page');
    return page ? Number(page) : undefined;
  }
}

function groupConversationSummaries(items) {
  const conversations = new Map();

  items.forEach((item) => {
    if (!conversations.has(item.conversation_id)) {
      conversations.set(item.conversation_id, item);
    }
  });

  const grouped = {};
  Array.from(conversations.values()).forEach((item) => {
    const key = new Date(item.timestamp).toDateString();
    grouped[key] = grouped[key] || [];
    grouped[key].push(item);
  });

  return Object.entries(grouped).map(([label, entries]) => ({
    label,
    items: entries.sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp)),
  }));
}

function historyToMessages(entries) {
  return [...entries]
    .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp))
    .flatMap((item) => [
      {
        id: `${item.id}-user`,
        role: 'user',
        content: item.query,
        timestamp: item.timestamp,
      },
      {
        id: `${item.id}-assistant`,
        role: 'assistant',
        content: item.response,
        timestamp: item.timestamp,
        citations: item.citations,
      },
    ]);
}

export default function Chat() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);
  const [searchParams] = useSearchParams();
  const initialDocumentId = searchParams.get('document') || '';
  const { chatHistoryOpen, toggleChatHistory } = useUIStore();
  const [conversationId, setConversationId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(initialDocumentId);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const historyQuery = useInfiniteQuery({
    queryKey: ['chat-history'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getChatHistory({ page: pageParam, pageSize: 12 }),
    getNextPageParam: (lastPage) => getNextPageFromUrl(lastPage.next),
  });

  const documentsQuery = useQuery({
    queryKey: ['documents', 'selector'],
    queryFn: () => getDocuments({ page: 1, pageSize: 100 }),
  });

  const conversationQuery = useQuery({
    queryKey: ['chat-conversation', conversationId],
    queryFn: () => getChatHistory({ conversationId, page: 1, pageSize: 100 }),
    enabled: Boolean(conversationId),
  });

  const historyItems = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.results || []) || [],
    [historyQuery.data],
  );
  const groupedHistory = useMemo(() => groupConversationSummaries(historyItems), [historyItems]);
  const documentOptions = documentsQuery.data?.results || [];

  useEffect(() => {
    if (initialDocumentId) {
      return;
    }

    if (!conversationId && groupedHistory[0]?.items[0]?.conversation_id) {
      setConversationId(groupedHistory[0].items[0].conversation_id);
    }
  }, [conversationId, groupedHistory, initialDocumentId]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    if (conversationQuery.data?.results) {
      setMessages(historyToMessages(conversationQuery.data.results));
    }
  }, [conversationId, conversationQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, historyQuery.isFetchingNextPage]);

  const sendMutation = useMutation({
    mutationFn: (payload) => sendChatQuery(payload),
    onSuccess: (response) => {
      const nextConversationId = response.conversation_id;
      setConversationId(nextConversationId);
      setMessages((current) => [
        ...current,
        {
          id: `${response.history_id}-assistant`,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          citations: response.citations,
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversation', nextConversationId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.detail || 'Unable to get a response right now.');
    },
  });

  const handleSend = () => {
    const question = input.trim();
    if (!question) {
      return;
    }

    const timestamp = new Date().toISOString();
    setMessages((current) => [
      ...current,
      {
        id: `local-user-${timestamp}`,
        role: 'user',
        content: question,
        timestamp,
      },
    ]);
    setInput('');

    sendMutation.mutate({
      query: question,
      conversationId,
      documentId: selectedDocumentId || undefined,
      topK: 5,
    });
  };

  return (
    <PageWrapper className="pb-6 pt-24">
      <section className="mx-auto flex max-w-7xl flex-col gap-4 lg:h-[calc(100vh-128px)] lg:flex-row">
        <div className={`transition-all duration-200 ${chatHistoryOpen ? 'lg:w-[280px]' : 'lg:w-[76px]'}`}>
          {chatHistoryOpen ? (
            <ChatHistory
              groupedHistory={groupedHistory}
              selectedConversationId={conversationId}
              onSelectConversation={setConversationId}
              onNewChat={() => {
                setConversationId(null);
                setMessages([]);
              }}
              onLoadMore={() => historyQuery.fetchNextPage()}
              hasNextPage={Boolean(historyQuery.hasNextPage)}
              isLoadingMore={historyQuery.isFetchingNextPage}
            />
          ) : (
            <div className="glass-card neural-outline flex h-full items-center justify-center rounded-[30px]">
              <button type="button" className="rounded-full border border-white/10 bg-white/5 p-3" onClick={toggleChatHistory}>
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="glass-panel neural-outline flex flex-1 flex-col rounded-[34px]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-display text-2xl font-semibold">Neural Chat</p>
              <p className="text-sm text-slate-400">Grounded responses only. Every answer is tied back to retrieved evidence.</p>
            </div>
            <button type="button" className="rounded-full border border-white/10 bg-white/5 p-3" onClick={toggleChatHistory}>
              {chatHistoryOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>
          </div>

          <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5">
            {messages.length ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {sendMutation.isPending ? <TypingIndicator /> : null}
                <div ref={bottomRef} />
              </div>
            ) : (
              <EmptyState
                title="Start a grounded conversation"
                description="Ask across every indexed document or narrow the context to one specific file."
              />
            )}
          </div>

          <div className="border-t border-white/10 p-5">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              isSending={sendMutation.isPending}
              documents={documentOptions}
              selectedDocumentId={selectedDocumentId}
              onDocumentChange={setSelectedDocumentId}
            />
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
