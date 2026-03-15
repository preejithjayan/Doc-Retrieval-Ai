import api from './api';

const analyticsService = {
  overview: () => api.get('/analytics/overview'),
};

export default analyticsService;

