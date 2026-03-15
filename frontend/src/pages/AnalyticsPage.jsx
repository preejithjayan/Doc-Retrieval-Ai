import { useEffect, useState } from 'react';

import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import analyticsService from '../services/analyticsService';

export default function AnalyticsPage() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await analyticsService.overview();
        setPayload(data);
      } catch {
        setError('Analytics are available to managers and admins.');
      }
    };

    load();
  }, []);

  if (error) {
    return <div className="panel px-6 py-5 text-sm text-console-muted">{error}</div>;
  }

  if (!payload) {
    return <div className="panel px-6 py-5 text-sm text-console-muted">Loading analytics...</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Analytics"
        title="Operational analytics"
        description="Review user distribution, document throughput, and the currently active inference route from an operations-focused reporting view."
        details={['Manager access', 'User counts', 'Document status', 'Model visibility']}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard eyebrow="Users" value={payload.overview.total_users} detail="Registered platform accounts." tone="blue" />
        <StatCard eyebrow="Documents" value={payload.overview.total_documents} detail="Tracked documents across the workspace." tone="neutral" />
        <StatCard eyebrow="Processed" value={payload.overview.processed_documents} detail="Documents with completed embeddings." tone="success" />
        <StatCard eyebrow="Active model" value={payload.overview.active_model} detail="Current generation profile." tone="orange" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel overflow-hidden">
          <div className="border-b border-console-border bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-console-text">Documents by status</p>
          </div>
          <div className="divide-y divide-slate-100">
            {payload.documents_by_status.map((item) => (
              <div key={item.status} className="flex items-center justify-between px-5 py-4 text-sm">
                <span className="font-semibold text-console-text">{item.status}</span>
                <span className="text-console-muted">{item.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-console-border bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-console-text">Users by role</p>
          </div>
          <div className="divide-y divide-slate-100">
            {payload.users_by_role.map((item) => (
              <div key={item.role__code} className="flex items-center justify-between px-5 py-4 text-sm">
                <span className="font-semibold text-console-text">{item.role__code || 'UNASSIGNED'}</span>
                <span className="text-console-muted">{item.total}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

