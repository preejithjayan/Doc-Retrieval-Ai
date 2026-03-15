import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FilePlus2, MessageSquarePlus, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UploadDialog from '../../components/documents/UploadDialog';
import EmptyState from '../../components/ui/EmptyState';
import MetricCard from '../../components/ui/MetricCard';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { analyticsApi } from '../../lib/api/analytics';
import { chatApi } from '../../lib/api/chat';
import { documentsApi } from '../../lib/api/documents';
import { formatDateTime } from '../../lib/utils/format';
import { useAuthStore } from '../../stores/authStore';
import { useModelStore } from '../../stores/modelStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentModel = useModelStore((state) => state.currentModel);
  const [uploadOpen, setUploadOpen] = useState(false);
  const role = user?.role_code || 'VIEWER';
  const canUpload = ['ANALYST', 'MANAGER', 'ADMIN'].includes(role);
  const canSwitchModel = ['MANAGER', 'ADMIN'].includes(role);

  const analyticsQuery = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const { data } = await analyticsApi.overview();
      return data;
    },
    retry: false,
  });

  const documentsQuery = useQuery({
    queryKey: ['dashboard-documents'],
    queryFn: async () => {
      const { data } = await documentsApi.list({ page_size: 5 });
      return data;
    },
  });

  const chatHistoryQuery = useQuery({
    queryKey: ['dashboard-chat-history'],
    queryFn: async () => {
      const { data } = await chatApi.history();
      return data.results || [];
    },
  });

  const fallbackOverview = useMemo(() => {
    const history = chatHistoryQuery.data || [];
    const today = new Date().toDateString();
    return {
      total_documents: documentsQuery.data?.count || documentsQuery.data?.results?.length || 0,
      active_model: currentModel?.model_name || 'Not set',
      queries_today: history.filter((item) => new Date(item.timestamp).toDateString() === today).length,
      total_users: user ? 1 : 0,
      recent_activity: [
        ...(documentsQuery.data?.results || []).map((item) => ({
          id: `document-${item.id}`,
          type: 'document_upload',
          title: item.file_name,
          actor: item.uploaded_by_email,
          meta: item.status,
          timestamp: item.upload_time,
        })),
        ...history.slice(0, 5).map((item) => ({
          id: `chat-${item.id}`,
          type: 'chat_query',
          title: item.query,
          actor: user?.email || 'Current user',
          meta: item.model_name,
          timestamp: item.timestamp,
        })),
      ]
        .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
        .slice(0, 5),
    };
  }, [chatHistoryQuery.data, currentModel?.model_name, documentsQuery.data, user]);

  const overview = analyticsQuery.data?.overview || fallbackOverview;
  const activity = analyticsQuery.data?.recent_activity || fallbackOverview.recent_activity || [];
  const loading = analyticsQuery.isLoading || documentsQuery.isLoading || chatHistoryQuery.isLoading;

  const quickActions = [
    { label: 'Open document library', description: 'Review uploads, processing state, and document details.', to: '/documents', visible: true },
    { label: 'Start a cited conversation', description: 'Send a question to the RAG assistant with conversation memory.', to: '/chat', visible: true },
    { label: 'Upload a new document', description: 'Send files into OCR, chunking, and embedding processing.', action: () => setUploadOpen(true), visible: canUpload },
    { label: 'Inspect model routing', description: 'Review and switch the active inference target for the assistant.', to: '/models', visible: canSwitchModel },
    { label: 'Inspect settings', description: 'Manage your session, profile fields, and theme preferences.', to: '/settings', visible: true },
  ].filter((item) => item.visible);

  return (
    <>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard"
          title="Operational overview"
          description="A dense command surface for ingestion throughput, chat usage, recent activity, and model routing across the retrieval workspace."
          actions={
            <>
              {canUpload ? (
                <button type="button" onClick={() => setUploadOpen(true)} className="primary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                  <FilePlus2 size={16} />
                  Upload document
                </button>
              ) : null}
              <button type="button" onClick={() => navigate('/chat')} className="secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                <MessageSquarePlus size={16} />
                New chat
              </button>
              {canSwitchModel ? (
                <button type="button" onClick={() => navigate('/models')} className="secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                  <Sparkles size={16} />
                  Switch model
                </button>
              ) : null}
            </>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-[28px]" />)
          ) : (
            <>
              <MetricCard label="Total Documents" value={overview.total_documents ?? 0} hint="Files currently tracked by the retrieval index." tone="accent" />
              <MetricCard label="Active Model" value={overview.active_model || currentModel?.model_name || 'Not set'} hint="Current routing target for assistant responses." tone="warning" />
              <MetricCard label="Queries Today" value={overview.queries_today ?? 0} hint="Chat requests recorded for the current date." tone="success" />
              <MetricCard label="Users" value={overview.total_users ?? 0} hint="Workspace access count visible to your role." tone="default" />
            </>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="panel-frame rounded-[30px] px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent activity</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">The last chat prompts and document uploads observed by your accessible APIs.</p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--text-muted)]">Last 5</span>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-[24px]" />)
              ) : activity.length ? (
                activity.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/6 bg-black/12 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.actor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{item.meta || item.type}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatDateTime(item.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No activity yet" description="Upload a document or start a chat to populate the activity stream." />
              )}
            </div>
          </div>

          <div className="panel-frame rounded-[30px] px-6 py-5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Quick actions</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Shortcuts to the most common operator workflows.</p>
            <div className="mt-5 space-y-3">
              {quickActions.map((item) => (
                <button
                  key={item.to || item.label}
                  type="button"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                      return;
                    }
                    navigate(item.to);
                  }}
                  className="group w-full rounded-[24px] border border-white/6 bg-black/12 px-4 py-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{item.description}</p>
                    </div>
                    <ArrowRight size={16} className="mt-1 text-[var(--accent-primary)] transition group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
