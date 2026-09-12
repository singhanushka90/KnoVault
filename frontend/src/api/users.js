import api from './axios'

export const usersApi = {
  teamMembers: () => api.get('/team-members'),
  deleteTeamMember: (userId) => api.delete(`/team-members/${userId}`)
}
