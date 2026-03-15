import { apiClient } from './client';

export const documentsApi = {
  list: (params) => apiClient.get('/documents/list', { params }),
  search: (params) => apiClient.get('/documents/search', { params }),
  detail: (id) => apiClient.get(`/documents/${id}`),
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file_path', file);
    return apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  process: (documentId) => apiClient.post('/documents/process', { document_id: documentId, run_async: true }),
  remove: (id) => apiClient.delete(`/documents/${id}`),
};

