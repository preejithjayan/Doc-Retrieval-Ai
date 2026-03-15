import { useQuery } from '@tanstack/react-query';
import { FileWarning, Trash2 } from 'lucide-react';

import { documentsApi } from '../../lib/api/documents';
import { formatDateTime } from '../../lib/utils/format';
import Drawer from '../ui/Drawer';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import DocumentStatusBadge from './DocumentStatusBadge';

export default function DocumentDetailDrawer({ documentId, open, onClose, onDelete }) {
  const { data, isLoading } = useQuery({
    queryKey: ['document-detail', documentId],
    queryFn: async () => {
      const { data } = await documentsApi.detail(documentId);
      return data;
    },
    enabled: open && Boolean(documentId),
  });

  const document = data;

  return (
    <Drawer open={open} onClose={onClose} title={document?.file_name || 'Document details'}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !document ? (
        <EmptyState icon={FileWarning} title="Document not found" description="Select a document from the table to inspect metadata, preview snippets, and chunk information." />
      ) : (
        <div className="space-y-6">
          <div className="panel-frame rounded-[24px] px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Status</p>
                <div className="mt-2"><DocumentStatusBadge status={document.status} /></div>
              </div>
              {onDelete ? (
                <button type="button" onClick={() => onDelete(document)} className="danger-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
                  <Trash2 size={16} />
                  Delete document
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel-frame rounded-[24px] px-5 py-5">
              <p className="form-label">Metadata</p>
              <dl className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex justify-between gap-4"><dt>Type</dt><dd>{document.file_type || 'Unknown'}</dd></div>
                <div className="flex justify-between gap-4"><dt>Uploaded by</dt><dd>{document.uploaded_by_email}</dd></div>
                <div className="flex justify-between gap-4"><dt>Uploaded</dt><dd>{formatDateTime(document.upload_time)}</dd></div>
                <div className="flex justify-between gap-4"><dt>Chunks</dt><dd>{document.chunk_count || 0}</dd></div>
                <div className="flex justify-between gap-4"><dt>Scanned</dt><dd>{document.is_scanned ? 'Yes' : 'No'}</dd></div>
              </dl>
            </div>
            <div className="panel-frame rounded-[24px] px-5 py-5">
              <p className="form-label">Processing log</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                {document.processing_log || 'No processing log has been generated yet.'}
              </p>
            </div>
          </div>

          <div className="panel-frame rounded-[24px] px-5 py-5">
            <p className="form-label">Preview snippet</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              {document.chunks?.[0]?.chunk_text || 'The first chunk preview will appear here after processing completes.'}
            </p>
          </div>

          <div className="panel-frame rounded-[24px] px-5 py-5">
            <p className="form-label">Indexed chunks</p>
            <div className="mt-4 space-y-3">
              {document.chunks?.length ? (
                document.chunks.slice(0, 8).map((chunk) => (
                  <div key={chunk.id} className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Chunk {chunk.chunk_index}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{chunk.chunk_text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">No chunks available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
