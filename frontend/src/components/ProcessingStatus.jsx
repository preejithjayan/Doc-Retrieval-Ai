export default function ProcessingStatus({ documents }) {
  const processing = documents.filter((item) => item.status === 'PROCESSING' || item.status === 'UPLOADED');

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-console-border bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-console-text">Processing queue</p>
            <p className="mt-1 text-xs text-console-muted">Monitor ingestion jobs as they move through extraction and embedding.</p>
          </div>
          <span className="tag-muted">Queue {processing.length}</span>
        </div>
      </div>
      <div className="p-5">
        {processing.length === 0 ? (
          <p className="text-sm text-console-muted">No documents are currently waiting in the queue.</p>
        ) : (
          <div className="space-y-3">
            {processing.map((document) => (
              <div key={document.id} className="rounded-lg border border-console-border bg-[#fafbfc] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-console-text">{document.file_name}</p>
                    <p className="mt-1 text-xs text-console-muted">{document.processing_log || 'Queued for processing.'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-console-muted">Progress</p>
                    <p className="mt-1 text-sm font-semibold text-console-text">{document.processing_progress || 0}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-console-blue" style={{ width: `${document.processing_progress || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

