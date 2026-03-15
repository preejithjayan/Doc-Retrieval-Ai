import api from './api';

const chatService = {
  query: (payload) => api.post('/chat/query', payload),
  history: () => api.get('/chat/history'),
};

export default chatService;

