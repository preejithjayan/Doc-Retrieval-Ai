import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import DocumentTable from '../components/DocumentTable';
import PageHeader from '../components/PageHeader';
import UploadWidget from '../components/UploadWidget';
import documentService from '../services/documentService';

export default function DocumentLibraryPage() {
  const [documents, setDocuments] = useState([]);

  const loadDocuments = async () => {
    const { data } = await documentService.list({ page_size: 50 });
    setDocuments(data.results || []);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleProcess = async (document) => {
    await documentService.process({ document_id: document.id, run_async: true });
    await loadDocuments();
  };

  const handleDelete = async (document) => {
    await documentService.remove(document.id);
    await loadDocuments();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Documents"
        title="Document library"
        description="Manage uploaded files, confirm document status, and trigger ingestion jobs when analysts or managers need to reprocess content."
        actions={
          <button type="button" onClick={loadDocuments} className="console-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <RefreshCcw size={16} />
            Refresh
          </button>
        }
        details={['Upload management', 'Status tracking', 'Chunk counts', 'Deletion controls']}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <UploadWidget onUploaded={loadDocuments} />
        <div className="panel px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-console-muted">Operations notes</p>
          <h3 className="mt-2 text-xl font-semibold text-console-text">How this view is intended to be used</h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-console-muted">
            <p>Analysts upload raw content and submit processing runs when new material is ready for indexing.</p>
            <p>Managers can audit file state, review failures, and remove obsolete documents from the working set.</p>
            <p>Chunk counts and timestamps help confirm whether embeddings reflect the latest document version.</p>
          </div>
        </div>
      </div>

      <DocumentTable documents={documents} onProcess={handleProcess} onDelete={handleDelete} />
    </div>
  );
}

