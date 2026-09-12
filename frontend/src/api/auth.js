import api from './axios'

export const authApi = {
  login: (payload) => {
    const body = new URLSearchParams()
    body.append('username', payload.email)
    body.append('password', payload.password)

    return api.post('/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },

  signup: (payload) => api.post('/signup', payload),
  profile: () => api.get('/profile'),
  getTeamMembers: () => api.get('/team-members'),
}
