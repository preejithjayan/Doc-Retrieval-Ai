import { Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTilt } from '../../hooks/useTilt';
import { formatBytes } from '../../utils/formatBytes';
import { formatDate } from '../../utils/formatDate';
import Badge from '../ui/Badge';

const statusTone = {
  PROCESSED: 'success',
  PROCESSING: 'info',
  UPLOADED: 'warning',
  FAILED: 'danger',
};

export default function DocumentCard({ document, canDelete, onDelete }) {
  const tiltProps = useTilt();

  return (
    <article className="glass-card neural-outline rounded-[28px] p-5" {...tiltProps}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-semibold text-white">{document.file_name}</p>
          <p className="mt-1 text-sm text-slate-400">
            {formatDate(document.upload_time)} • {formatBytes(document.file_size)}
          </p>
        </div>
        <Badge tone={statusTone[document.status] || 'default'}>{document.status}</Badge>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">Type</p>
          <p className="mt-2 text-white">{document.file_type || document.file_extension || 'Unknown'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">Chunks</p>
          <p className="mt-2 text-white">{document.chunk_count || 0}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <Link
          to={`/documents/${document.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm text-cyan transition hover:bg-cyan/15"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
        {canDelete ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200"
            onClick={() => onDelete(document)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
