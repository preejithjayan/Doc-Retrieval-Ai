import apiClient from './client';

export async function getChatHistory(params = {}) {
  const { data } = await apiClient.get('/chat/history', {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
      conversation_id: params.conversationId || undefined,
    },
  });
  return data;
}

export async function sendChatQuery(payload) {
  const { data } = await apiClient.post('/chat/query', {
    query: payload.query,
    conversation_id: payload.conversationId || undefined,
    document_id: payload.documentId || undefined,
    top_k: payload.topK ?? 5,
  });
  return data;
}
