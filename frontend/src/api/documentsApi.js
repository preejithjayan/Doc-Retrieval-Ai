import apiClient from './client';

function buildDocumentParams(filters = {}) {
  return {
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 10,
    q: filters.search || undefined,
    status: filters.status && filters.status !== 'ALL' ? filters.status : undefined,
    file_type: filters.fileType && filters.fileType !== 'ALL' ? filters.fileType.toLowerCase() : undefined,
    date_from: filters.dateFrom || undefined,
    date_to: filters.dateTo || undefined,
  };
}

export async function getDocuments(filters = {}) {
  const { data } = await apiClient.get('/documents/list', {
    params: buildDocumentParams(filters),
  });
  return data;
}

export async function searchDocuments(filters = {}) {
  const { data } = await apiClient.get('/documents/search', {
    params: buildDocumentParams(filters),
  });
  return data;
}

export async function getDocument(id) {
  const { data } = await apiClient.get(`/documents/${id}`);
  return data;
}

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file_path', file);

  const { data } = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return data;
}

export async function processDocument(documentId, runAsync = false) {
  const { data } = await apiClient.post('/documents/process', {
    document_id: documentId,
    run_async: runAsync,
  });
  return data;
}

export async function deleteDocument(id) {
  const { data } = await apiClient.delete(`/documents/${id}`);
  return data;
}
