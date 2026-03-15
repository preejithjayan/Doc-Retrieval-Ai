import apiClient from './client';

export async function getUsers(params = {}) {
  const { data } = await apiClient.get('/users/', {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 15,
      search: params.search || undefined,
      role: params.role && params.role !== 'ALL' ? params.role : undefined,
    },
  });
  return data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users/', payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get('/users/me');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.patch('/users/me', payload);
  return data;
}
