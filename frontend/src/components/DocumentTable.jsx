import { Trash2, Wand2 } from 'lucide-react';

import { formatDate, statusTone } from '../utils/formatters';

export default function DocumentTable({ documents, onProcess, onDelete }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-console-border bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-console-text">Document inventory</p>
        <p className="mt-1 text-xs text-console-muted">Review document state, chunk counts, ownership, and available actions.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-console-muted">
            <tr>
              <th className="px-5 py-3">Document</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Chunks</th>
              <th className="px-5 py-3">Uploaded by</th>
              <th className="px-5 py-3">Timestamp</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-console-text">
            {documents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-sm text-console-muted">
                  No documents are available yet.
                </td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 align-top">
                    <p className="font-semibold text-console-blue">{document.file_name}</p>
                    <p className="mt-1 text-xs text-console-muted">{document.file_type || 'Pending type detection'}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={statusTone(document.status)}>{document.status}</span>
                  </td>
                  <td className="px-5 py-4 align-top">{document.chunk_count ?? 0}</td>
                  <td className="px-5 py-4 align-top text-console-muted">{document.uploaded_by_email}</td>
                  <td className="px-5 py-4 align-top text-console-muted">{formatDate(document.upload_time)}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      {onProcess ? (
                        <button
                          type="button"
                          onClick={() => onProcess(document)}
                          className="console-button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                        >
                          <Wand2 size={16} />
                          Process
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(document)}
                          className="console-button-danger inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

