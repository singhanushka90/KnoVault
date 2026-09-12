import api from './axios'

export const chatApi = {
  ask: (payload) => api.post('/ask', null, {
    params: {
      question: payload.question,
      conversation_id: payload.conversation_id || undefined
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),

  listChats: () => api.get('/chats'),

  getConversation: (conversationId) => api.get(`/chats/${conversationId}`),

  listCompanyChats: () => api.get('/company/chats')
}
