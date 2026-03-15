import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

import { getDocument } from '../api/documentsApi';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';

const tabs = ['preview', 'text', 'embeddings', 'log'];

export default function DocumentDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('preview');

  const documentQuery = useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(id),
  });

  const document = documentQuery.data;

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl">
        {documentQuery.isLoading ? (
          <Skeleton className="h-[520px] rounded-[32px]" />
        ) : (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Document Detail</p>
                <h1 className="mt-4 font-display text-4xl font-semibold">{document.file_name}</h1>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Badge tone={document.status === 'PROCESSED' ? 'success' : document.status === 'FAILED' ? 'danger' : 'info'}>
                    {document.status}
                  </Badge>
                  <Badge tone="default">{document.file_type || document.file_extension}</Badge>
                  <Badge tone="default">{formatBytes(document.file_size)}</Badge>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Uploaded {formatDate(document.upload_time)} • {document.chunk_count} chunks • {document.is_scanned ? 'OCR assisted' : 'Native text'}
                </p>
              </div>
              <Button as={Link} to={`/chat?document=${document.id}`}>
                Ask about this document
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full border px-4 py-2 text-sm capitalize ${
                    activeTab === tab ? 'border-cyan/30 bg-cyan/10 text-cyan' : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  {tab === 'text' ? 'Extracted Text' : tab === 'log' ? 'Processing Log' : tab === 'embeddings' ? 'Embeddings Info' : 'Preview'}
                </button>
              ))}
            </div>

            <div className="mt-8 glass-card neural-outline rounded-[32px] p-6">
              {activeTab === 'preview' ? (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
                  {document.file_type === 'pdf' ? (
                    <iframe src={document.file_url} title={document.file_name} className="h-[720px] w-full" />
                  ) : document.file_type === 'image' ? (
                    <img src={document.file_url} alt={document.file_name} className="h-auto max-h-[720px] w-full object-contain" />
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center">
                      <Button as="a" href={document.file_url} target="_blank" rel="noreferrer">
                        Open Source File
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === 'text' ? (
                <pre className="scrollbar-thin max-h-[720px] overflow-auto whitespace-pre-wrap rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-200">
                  {document.cleaned_text || document.extracted_text || 'No extracted text is available yet.'}
                </pre>
              ) : null}

              {activeTab === 'embeddings' ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">Chunk Count</p>
                      <p className="mt-3 font-display text-3xl font-semibold">{document.chunk_count}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">Embeddings</p>
                      <p className="mt-3 font-display text-3xl font-semibold">{document.has_embeddings ? 'Ready' : 'Missing'}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">Metadata</p>
                      <p className="mt-3 font-display text-lg font-semibold text-slate-200">{Object.keys(document.metadata || {}).length} keys</p>
                    </div>
                  </div>
                  <div className="scrollbar-thin max-h-[520px] overflow-auto rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="grid gap-3">
                      {(document.chunks || []).map((chunk) => (
                        <div key={chunk.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                          <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan/70">Chunk {chunk.chunk_index + 1}</p>
                          <p className="mt-3 text-sm leading-7 text-slate-300">{chunk.chunk_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'log' ? (
                <pre className="scrollbar-thin max-h-[720px] overflow-auto whitespace-pre-wrap rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-200">
                  {document.processing_log || 'No processing log has been recorded yet.'}
                </pre>
              ) : null}
            </div>
          </>
        )}
      </section>
    </PageWrapper>
  );
}
