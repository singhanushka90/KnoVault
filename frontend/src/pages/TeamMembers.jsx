import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { authApi } from '../api/auth.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function TeamMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await authApi.getTeamMembers()
      setMembers(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  return (
    <div className="team-page">
      <section className="page-head">
        <div>
          <span className="section-label">Organization</span>
          <h1>Team Members</h1>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading label="Loading team..." />
      ) : members.length === 0 ? (
        <div className="empty-state">
          <Users size={40} />
          <h3>No team members found</h3>
          <p>Your workspace has no team members yet.</p>
        </div>
      ) : (
        <section className="team-grid">
          {members.map((member) => (
            <article className="team-card" key={member._id}>
              <div className="team-card-head">
                <div className="avatar">{(member.name || 'K').slice(0, 1)}</div>
                <div>
                  <div className="team-name">{member.name}</div>
                  <div className="team-email">{member.email}</div>
                </div>
              </div>
              <div className="team-detail">
                <span className="role-badge small-badge">{member.role}</span>
                <span className="status-chip">{member.status || 'Active'}</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
