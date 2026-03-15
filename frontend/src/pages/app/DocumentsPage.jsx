import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, RefreshCcw, Search, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import DocumentDetailDrawer from '../../components/documents/DocumentDetailDrawer';
import DocumentStatusBadge from '../../components/documents/DocumentStatusBadge';
import UploadDialog from '../../components/documents/UploadDialog';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { documentsApi } from '../../lib/api/documents';
import { formatDateTime } from '../../lib/utils/format';
import { useAuthStore } from '../../stores/authStore';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role_code || 'VIEWER');
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(searchParams.get('document'));
  const canUpload = ['ANALYST', 'MANAGER', 'ADMIN'].includes(role);
  const canProcess = ['ANALYST', 'MANAGER', 'ADMIN'].includes(role);
  const canDelete = ['MANAGER', 'ADMIN'].includes(role);

  const documentsQuery = useQuery({
    queryKey: ['documents', { page, search }],
    queryFn: async () => {
      const { data } = await documentsApi.list({ page, search, page_size: 10 });
      return data;
    },
    refetchInterval: (query) => {
      const results = query.state.data?.results || [];
      return results.some((item) => item.status === 'PROCESSING') ? 5000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId) => {
      await documentsApi.remove(documentId);
      return documentId;
    },
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: ['documents'] });
      const previous = queryClient.getQueriesData({ queryKey: ['documents'] });
      queryClient.setQueriesData({ queryKey: ['documents'] }, (old) => {
        if (!old?.results) return old;
        return {
          ...old,
          results: old.results.filter((item) => item.id !== documentId),
          count: Math.max((old.count || 1) - 1, 0),
        };
      });
      return { previous };
    },
    onError: (_error, _documentId, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Unable to delete document.');
    },
    onSuccess: () => {
      toast.success('Document deleted.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
  });

  const processMutation = useMutation({
    mutationFn: async (documentId) => {
      const { data } = await documentsApi.process(documentId);
      return data;
    },
    onSuccess: () => {
      toast.success('Document queued for processing.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => {
      toast.error('Unable to queue document for processing.');
    },
  });

  const results = documentsQuery.data?.results || [];
  const totalPages = useMemo(() => Math.max(1, Math.ceil((documentsQuery.data?.count || 0) / 10)), [documentsQuery.data?.count]);

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  return (
    <>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DocumentDetailDrawer
        documentId={selectedDocumentId}
        open={Boolean(selectedDocumentId)}
        onClose={() => {
          setSelectedDocumentId(null);
          updateParams({ document: null });
        }}
        onDelete={canDelete ? (document) => setDeleteTarget(document) : undefined}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete document"
        description={`Delete ${deleteTarget?.file_name || 'this document'} from the library and remove its indexed chunks.`}
        confirmLabel="Delete document"
      />

      <div className="space-y-6">
        <PageHeader
          eyebrow="Documents"
          title="Document library"
          description="Search, inspect, upload, and manage every indexed file with live processing status and detail-level metadata inspection."
          actions={
            <>
              <button type="button" onClick={() => documentsQuery.refetch()} className="secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                <RefreshCcw size={16} />
                Refresh
              </button>
              {canUpload ? (
                <button type="button" onClick={() => setUploadOpen(true)} className="primary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                  <Upload size={16} />
                  Upload document
                </button>
              ) : null}
            </>
          }
          meta={[
            <Badge key="polling" tone="default">Polling every 5s while processing</Badge>,
            <Badge key="dragdrop" tone={canUpload ? 'accent' : 'default'}>{canUpload ? 'Drag and drop uploads' : 'Viewer access is read-only'}</Badge>,
          ]}
        />

        <section className="panel-frame rounded-[28px] px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setPage(1);
                    updateParams({ search, page: 1 });
                    documentsQuery.refetch();
                  }
                }}
                placeholder="Search documents by filename or uploader email"
                className="pl-11"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  updateParams({ search, page: 1 });
                  documentsQuery.refetch();
                }}
                className="secondary-button px-4 py-3 text-sm font-semibold"
              >
                Apply search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                  updateParams({ search: null, page: 1 });
                }}
                className="secondary-button px-4 py-3 text-sm font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        <section className="panel-frame overflow-hidden rounded-[30px]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] gap-4 border-b border-[var(--border-subtle)] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
            <span>Name</span>
            <span>Status</span>
            <span>Type</span>
            <span>Uploaded</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/6">
            {documentsQuery.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] gap-4 px-5 py-5">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ))
            ) : results.length ? (
              results.map((document) => (
                <div key={document.id} className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] gap-4 px-5 py-5 transition hover:bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{document.file_name}</p>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">{document.uploaded_by_email}</p>
                  </div>
                  <div className="flex items-start"><DocumentStatusBadge status={document.status} /></div>
                  <div className="text-sm text-[var(--text-secondary)]">{document.file_type || 'Pending'}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{formatDateTime(document.upload_time)}</div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocumentId(document.id);
                        updateParams({ document: document.id });
                      }}
                      className="icon-button"
                    >
                      <Eye size={16} />
                    </button>
                    {canProcess ? (
                      <button type="button" onClick={() => processMutation.mutate(document.id)} className="secondary-button px-3 py-2 text-xs font-semibold">
                        Process
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button type="button" onClick={() => setDeleteTarget(document)} className="danger-button inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12">
                <EmptyState title="No documents found" description="Upload a document or broaden the current search to populate the library." />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-5 py-4">
            <p className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const next = page - 1;
                  setPage(next);
                  updateParams({ page: next, search });
                }}
                className="secondary-button px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  updateParams({ page: next, search });
                }}
                className="secondary-button px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
