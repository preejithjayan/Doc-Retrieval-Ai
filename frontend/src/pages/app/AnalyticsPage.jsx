import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import ChartPanel from '../../components/analytics/ChartPanel';
import Badge from '../../components/ui/Badge';
import MetricCard from '../../components/ui/MetricCard';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { analyticsApi } from '../../lib/api/analytics';

const pieColors = ['#22d3ee', '#f59e0b', '#8b5cf6', '#10b981', '#fb7185', '#94a3b8'];

export default function AnalyticsPage() {
  const analyticsQuery = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const { data } = await analyticsApi.overview();
      return data;
    },
  });

  const overview = analyticsQuery.data?.overview;
  const queriesPerDay = analyticsQuery.data?.queries_per_day || [];
  const documentsPerWeek = analyticsQuery.data?.documents_per_week || [];
  const queriesByModel = analyticsQuery.data?.queries_by_model || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Workspace analytics"
        description="Visualize query throughput, upload patterns, model usage, and high-level KPI metrics derived from the analytics overview endpoint."
        meta={[
          <Badge key="series" tone="accent">Last 30 days</Badge>,
          <Badge key="models" tone="warning">Model distribution</Badge>,
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-[28px]" />)
        ) : (
          <>
            <MetricCard label="Total Documents" value={overview?.total_documents ?? 0} hint="Documents tracked by the workspace." tone="accent" />
            <MetricCard label="Total Queries" value={overview?.chat_queries ?? 0} hint="All recorded chatbot requests." tone="warning" />
            <MetricCard label="Active Users" value={overview?.active_users ?? 0} hint="Users currently marked active." tone="success" />
            <MetricCard label="Avg Response (ms)" value={overview?.average_response_time_ms ?? 0} hint="Average generation duration recorded in chat history." tone="default" />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Queries per day" description="Daily chatbot traffic over the last 30 days.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={queriesPerDay}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1720', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
              <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Documents uploaded per week" description="Weekly ingestion volume over the last 12 weeks.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={documentsPerWeek}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1720', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <ChartPanel title="Queries by model" description="Distribution of chat traffic by routed model.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ background: '#0f1720', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
              <Pie data={queriesByModel} dataKey="total" nameKey="model_name" innerRadius={64} outerRadius={108} paddingAngle={4}>
                {queriesByModel.map((entry, index) => (
                  <Cell key={entry.model_name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Role distribution" description="Users grouped by role from the analytics overview.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsQuery.data?.users_by_role || []} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="role__code" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: '#0f1720', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
              <Bar dataKey="total" fill="#22d3ee" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>
    </div>
  );
}

