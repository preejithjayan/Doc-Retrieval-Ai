import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  deleteDocument,
  processDocument,
  searchDocuments,
  uploadDocument,
} from '../api/documentsApi';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentFilters from '../components/documents/DocumentFilters';
import UploadModal from '../components/documents/UploadModal';
import PageWrapper from '../components/layout/PageWrapper';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

const initialFilters = {
  search: '',
  status: 'ALL',
  fileType: 'ALL',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 10,
};

export default function Documents() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { hasMinimumRole } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [progress, setProgress] = useState(0);
  const debouncedSearch = useDebounce(filters.search, 300);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const documentsQuery = useQuery({
    queryKey: ['documents', effectiveFilters],
    queryFn: () => searchDocuments(effectiveFilters),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setProgress(0);
      const uploadResponse = await uploadDocument(file, (event) => {
        const percent = Math.round(((event.loaded || 0) / (event.total || 1)) * 70);
        setProgress(percent);
      });
      setProgress(80);
      const processResponse = await processDocument(uploadResponse.document.id, false);
      setProgress(100);
      return processResponse;
    },
    onSuccess: () => {
      toast.success('Document uploaded and processed.');
      setUploadOpen(false);
      setProgress(0);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.detail || 'Failed to upload document.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId) => deleteDocument(documentId),
    onSuccess: () => {
      toast.success('Document deleted.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
    onError: () => {
      toast.error('Unable to delete that document.');
    },
  });

  const documents = documentsQuery.data?.results || [];

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Document Library</p>
            <h1 className="mt-4 font-display text-4xl font-semibold">Search, manage, and ingest every file.</h1>
          </div>
        </div>

        <div className="mt-8">
          <DocumentFilters
            filters={filters}
            onSearchChange={(value) => setFilters((current) => ({ ...current, search: value, page: 1 }))}
            onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))}
          />
        </div>

        <div className="mt-8">
          {documentsQuery.isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[280px] rounded-[28px]" />
              ))}
            </div>
          ) : documents.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  canDelete={hasMinimumRole('MANAGER')}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Upload your first document"
              description="The index is empty. Bring in your first file to unlock retrieval, chat context, and analytics."
              action={
                <Button type="button" onClick={() => setUploadOpen(true)}>
                  Upload Document
                </Button>
              }
            />
          )}
        </div>

        {documentsQuery.data?.count ? (
          <div className="mt-8">
            <Pagination
              page={filters.page}
              pageSize={filters.pageSize}
              count={documentsQuery.data.count}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </div>
        ) : null}

        <button
          type="button"
          className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full border border-cyan/30 bg-gradient-to-br from-cyan/20 to-violet/30 shadow-glow"
          onClick={() => setUploadOpen(true)}
          aria-label="Upload document"
        >
          <Plus className="h-7 w-7 text-white" />
        </button>

        <UploadModal
          isOpen={uploadOpen}
          onClose={() => {
            setUploadOpen(false);
            setProgress(0);
          }}
          onSubmit={(file) => uploadMutation.mutate(file)}
          isSubmitting={uploadMutation.isPending}
          progress={progress}
        />

        <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} className="max-w-md">
          <div className="p-6">
            <p className="font-display text-2xl font-semibold">Delete document?</p>
            <p className="mt-3 text-sm text-slate-400">
              This removes the document file and its indexed chunks. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={() => deleteMutation.mutate(deleteTarget.id)}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </section>
    </PageWrapper>
  );
}
