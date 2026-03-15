import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import ChatComposer from '../../components/chat/ChatComposer';
import ChatMessage from '../../components/chat/ChatMessage';
import ConversationHistory from '../../components/chat/ConversationHistory';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { chatApi } from '../../lib/api/chat';
import { useModelStore } from '../../stores/modelStore';

function latestConversationEntries(history) {
  const map = new Map();
  history.forEach((item) => {
    const current = map.get(item.conversation_id);
    if (!current || new Date(item.timestamp) > new Date(current.timestamp)) {
      map.set(item.conversation_id, item);
    }
  });
  return Array.from(map.values()).sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
}

function buildConversationMessages(history, conversationId) {
  return history
    .filter((item) => item.conversation_id === conversationId)
    .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp))
    .flatMap((item) => [
      { id: `${item.id}-user`, role: 'user', content: item.query },
      { id: `${item.id}-assistant`, role: 'assistant', content: item.response, citations: item.citations, modelName: item.model_name },
    ]);
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const currentModel = useModelStore((state) => state.currentModel);
  const [conversationId, setConversationId] = useState(null);
  const [composerValue, setComposerValue] = useState('');
  const [messages, setMessages] = useState([]);

  const historyQuery = useQuery({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const { data } = await chatApi.history();
      return data.results || [];
    },
  });

  const conversationList = useMemo(() => latestConversationEntries(historyQuery.data || []), [historyQuery.data]);

  useEffect(() => {
    if (!conversationId && conversationList.length) {
      setConversationId(conversationList[0].conversation_id);
    }
  }, [conversationId, conversationList]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setMessages(buildConversationMessages(historyQuery.data || [], conversationId));
  }, [conversationId, historyQuery.data]);

  const chatMutation = useMutation({
    mutationFn: async ({ query, conversationId }) => {
      const { data } = await chatApi.query({ query, conversation_id: conversationId || undefined, top_k: 5 });
      return data;
    },
    onMutate: ({ query }) => {
      const temporaryId = crypto.randomUUID();
      setMessages((current) => [
        ...current,
        { id: `${temporaryId}-user`, role: 'user', content: query },
        { id: `${temporaryId}-assistant`, role: 'assistant', content: 'Thinking through retrieved context...', citations: [], modelName: currentModel?.model_name || 'Routing' },
      ]);
      return { temporaryId };
    },
    onSuccess: (data, variables, context) => {
      setConversationId(data.conversation_id);
      setMessages((current) => {
        const withoutTemp = current.filter((item) => !item.id.startsWith(context.temporaryId));
        return [
          ...withoutTemp,
          { id: `${data.history_id}-user`, role: 'user', content: variables.query },
          { id: `${data.history_id}-assistant`, role: 'assistant', content: data.answer, citations: data.citations, modelName: data.model_name },
        ];
      });
      setComposerValue('');
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
    onError: () => {
      toast.error('Unable to complete the chat query.');
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Chat"
        title="Cited retrieval conversations"
        description="Search through uploaded material in conversational form, inspect the active model route, and expand citations on every assistant answer."
        meta={[
          <Badge key="model" tone="accent">{currentModel?.model_name || 'No model selected'}</Badge>,
          <Badge key="memory" tone="default">Conversation memory enabled</Badge>,
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="panel-frame rounded-[30px] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Conversation history</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Grouped by date and keyed by conversation thread.</p>
            </div>
            <Badge tone="default">{conversationList.length} Threads</Badge>
          </div>
          <div className="mt-5 max-h-[72vh] overflow-y-auto pr-1">
            {historyQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-[24px]" />)}
              </div>
            ) : conversationList.length ? (
              <ConversationHistory items={conversationList} activeConversationId={conversationId} onSelect={setConversationId} />
            ) : (
              <EmptyState title="No conversations yet" description="Start a new retrieval session to populate the history timeline." />
            )}
          </div>
        </section>

        <div className="space-y-4">
          <section className="panel-frame rounded-[30px] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Active conversation</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Assistant messages are rendered with expandable document citations.</p>
              </div>
              <Badge tone="accent">{currentModel?.model_name || 'Model pending'}</Badge>
            </div>
            <div className="mt-5 space-y-4">
              {messages.length ? (
                messages.map((message) => <ChatMessage key={message.id} message={message} />)
              ) : (
                <EmptyState title="No active thread" description="Select a conversation from the left or send a new query to begin." />
              )}
              {chatMutation.isPending ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">
                  <LoaderCircle size={14} className="animate-spin" />
                  Awaiting model response
                </div>
              ) : null}
            </div>
          </section>

          <ChatComposer
            value={composerValue}
            onChange={setComposerValue}
            disabled={chatMutation.isPending}
            onSubmit={(event) => {
              event.preventDefault();
              if (!composerValue.trim()) return;
              chatMutation.mutate({ query: composerValue.trim(), conversationId });
            }}
          />
        </div>
      </div>
    </div>
  );
}

