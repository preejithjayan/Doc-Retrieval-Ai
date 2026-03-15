import apiClient from './client';

export async function getAnalyticsOverview(params = {}) {
  const { data } = await apiClient.get('/analytics/overview', {
    params: {
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
    },
  });
  return data;
}
