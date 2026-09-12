import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('knowledgeos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('knowledgeos_token')
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      console.warn('Forbidden:', error.response?.data?.detail || 'Permission denied')
    }

    return Promise.reject(error)
  }
)

export default api
