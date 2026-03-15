import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bot, FileUp, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getAnalyticsOverview } from '../api/analyticsApi';
import PageWrapper from '../components/layout/PageWrapper';
import StatCounter from '../components/analytics/StatCounter';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';
import { truncate } from '../utils/truncate';

export default function Dashboard() {
  const { user, hasMinimumRole } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview', 'dashboard'],
    queryFn: () => getAnalyticsOverview(),
  });

  const overview = data?.overview;
  const recentDocuments = data?.recent_documents || [];
  const recentQueries = data?.recent_queries || [];

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">{formatDate(new Date(), { dateStyle: 'full' })}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              {greeting}, {user?.first_name || user?.full_name || 'Operator'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Your platform is live. Monitor ingestion throughput, jump into retrieval chat, and keep an eye on the active intelligence stack.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/documents">
              <FileUp className="h-4 w-4" />
              Upload Document
            </Button>
            <Button as={Link} to="/chat" variant="secondary">
              <Bot className="h-4 w-4" />
              Start Chat
            </Button>
            {hasMinimumRole('MANAGER') ? (
              <Button as={Link} to="/analytics" variant="secondary">
                <PieChart className="h-4 w-4" />
                View Analytics
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-[28px]" />)
          ) : (
            <>
              <StatCounter label="Documents" value={overview?.total_documents ?? 0} />
              <StatCounter label="Queries Today" value={overview?.queries_today ?? 0} accent="violet" />
              <StatCounter label="Active Model" value={overview?.active_model || 'Offline'} />
              <StatCounter label="Storage Used" value={formatBytes(overview?.storage_used_bytes ?? 0)} />
            </>
          )}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-card neural-outline rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-semibold">Recent Documents</p>
                <p className="mt-1 text-sm text-slate-400">Latest ingestion events and processing outcomes.</p>
              </div>
              <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-cyan/80 hover:text-cyan">
                Open Library
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
              <table className="min-w-full">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.28em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Filename</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((document) => (
                    <tr key={document.id} className="border-t border-white/10">
                      <td className="px-4 py-4 font-medium text-white">{document.file_name}</td>
                      <td className="px-4 py-4">
                        <Badge tone={document.status === 'PROCESSED' ? 'success' : document.status === 'FAILED' ? 'danger' : 'info'}>
                          {document.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">{formatDate(document.upload_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card neural-outline rounded-[30px] p-6">
            <div>
              <p className="font-display text-2xl font-semibold">Recent Chat Queries</p>
              <p className="mt-1 text-sm text-slate-400">The last five retrieval prompts answered by the platform.</p>
            </div>

            <div className="mt-5 grid gap-3">
              {recentQueries.map((query) => (
                <div key={query.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{truncate(query.query, 48)}</p>
                    <Badge tone="info">{query.model_name || 'Fallback'}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{formatDate(query.timestamp, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
