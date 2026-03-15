import apiClient from './client';

export async function getCurrentModel() {
  const { data } = await apiClient.get('/models/current');
  return data;
}

export async function switchModel(modelName) {
  const { data } = await apiClient.post('/models/switch', {
    model_name: modelName,
  });
  return data;
}
