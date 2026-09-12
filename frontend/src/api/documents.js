import api from './axios'

export const documentsApi = {
  list: () => api.get('/documents'),

  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload_documents', formData)
  },

  remove: (documentId) => api.delete(`/documents/${documentId}`),

  update: (documentId, fields) => api.put(`/documents/${documentId}`, null, {
    params: fields
  })
}
