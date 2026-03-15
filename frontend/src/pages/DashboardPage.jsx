import { useEffect, useState } from 'react';

import DocumentTable from '../components/DocumentTable';
import PageHeader from '../components/PageHeader';
import ProcessingStatus from '../components/ProcessingStatus';
import StatCard from '../components/StatCard';
import UploadWidget from '../components/UploadWidget';
import analyticsService from '../services/analyticsService';
import documentService from '../services/documentService';
import modelService from '../services/modelService';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);

  const loadData = async () => {
    const [docsResponse, modelResponse] = await Promise.all([
      documentService.list({ page_size: 8 }),
      modelService.current(),
    ]);
    setDocuments(docsResponse.data.results || []);
    setCurrentModel(modelResponse.data.current);

    try {
      const analyticsResponse = await analyticsService.overview();
      setAnalytics(analyticsResponse.data.overview);
    } catch {
      setAnalytics(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const queueCount = documents.filter((item) => item.status === 'PROCESSING' || item.status === 'UPLOADED').length;
  const processedCount = analytics?.processed_documents ?? documents.filter((item) => item.status === 'PROCESSED').length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Overview"
        title="Document operations console"
        description="Track ingestion health, monitor the queue, review recently uploaded documents, and confirm the currently routed inference model from one console view."
        details={['OCR extraction', 'Semantic search', 'RAG responses', 'Role-aware access']}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard eyebrow="Total documents" value={analytics?.total_documents ?? documents.length} detail="Files registered across the platform." tone="blue" />
        <StatCard eyebrow="Processed" value={processedCount} detail="Documents with chunks and embeddings ready." tone="success" />
        <StatCard eyebrow="Queue depth" value={queueCount} detail="Items waiting for OCR or embedding jobs." tone="orange" />
        <StatCard eyebrow="Active model" value={currentModel?.model_name || 'Not set'} detail={currentModel?.hardware_requirement || 'No model profile selected yet.'} tone="neutral" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <UploadWidget onUploaded={loadData} />
        <ProcessingStatus documents={documents} />
      </section>

      <DocumentTable
        documents={documents.slice(0, 6)}
        onProcess={async (document) => {
          await documentService.process({ document_id: document.id, run_async: true });
          await loadData();
        }}
      />
    </div>
  );
}

