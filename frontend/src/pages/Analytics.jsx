import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getAnalyticsOverview } from '../api/analyticsApi';
import ChartCard from '../components/analytics/ChartCard';
import StatCounter from '../components/analytics/StatCounter';
import PageWrapper from '../components/layout/PageWrapper';
import Skeleton from '../components/ui/Skeleton';
import { formatBytes } from '../utils/formatBytes';

const chartColors = ['#00E5FF', '#7C3AED', '#38BDF8', '#F59E0B', '#22C55E'];

export default function Analytics() {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
  });

  const analyticsQuery = useQuery({
    queryKey: ['analytics-overview', filters],
    queryFn: () => getAnalyticsOverview(filters),
  });

  const overview = analyticsQuery.data?.overview;

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Analytics</p>
            <h1 className="mt-4 font-display text-4xl font-semibold">Monitor platform activity, retrieval, and model usage.</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
            <input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analyticsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-[28px]" />)
          ) : (
            <>
              <StatCounter label="Queries in Range" value={analyticsQuery.data?.queries_in_range ?? 0} />
              <StatCounter label="Uploads in Range" value={analyticsQuery.data?.documents_uploaded_in_range ?? 0} accent="violet" />
              <StatCounter label="Avg Response" value={overview?.average_response_time_ms ?? 0} suffix="ms" />
              <StatCounter label="Storage" value={formatBytes(overview?.storage_used_bytes ?? 0)} />
            </>
          )}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Queries Over Time" subtitle="Daily retrieval and chat volume within the selected date range.">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsQuery.data?.queries_over_time || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line dataKey="total" type="monotone" stroke="#00E5FF" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Documents by Status" subtitle="Operational health of the ingestion pipeline.">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsQuery.data?.documents_by_status || []} dataKey="total" nameKey="status" innerRadius={70} outerRadius={110}>
                    {(analyticsQuery.data?.documents_by_status || []).map((entry, index) => (
                      <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Top Retrieved Documents" subtitle="Which documents appear most often in cited responses.">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsQuery.data?.top_retrieved_documents || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" hide />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Model Usage Distribution" subtitle="How frequently each active model is used for answer generation.">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsQuery.data?.model_usage_distribution || []} dataKey="total" nameKey="label" outerRadius={110}>
                    {(analyticsQuery.data?.model_usage_distribution || []).map((entry, index) => (
                      <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>
    </PageWrapper>
  );
}
