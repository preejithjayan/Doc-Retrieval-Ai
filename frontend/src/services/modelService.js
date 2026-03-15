import api from './api';

const modelService = {
  current: () => api.get('/models/current'),
  switch: (payload) => api.post('/models/switch', payload),
};

export default modelService;

