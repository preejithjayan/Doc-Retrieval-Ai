import api from './api';

const documentService = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file_path', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  list: (params = {}) => api.get('/documents/list', { params }),
  get: (id) => api.get(`/documents/${id}`),
  remove: (id) => api.delete(`/documents/${id}`),
  process: (payload) => api.post('/documents/process', payload),
  search: (params) => api.get('/documents/search', { params }),
};

export default documentService;

