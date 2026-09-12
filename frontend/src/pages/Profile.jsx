import { useEffect, useState } from 'react'
import { UserCircle, Building2, ShieldCheck } from 'lucide-react'
import { authApi } from '../api/auth.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await authApi.profile()
      setProfile(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  return (
    <div className="profile-page">
      <section className="page-head">
        <div>
          <span className="section-label">Account</span>
          <h1>Profile</h1>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading label="Loading profile..." />
      ) : !profile ? (
        <div className="empty-state"><UserCircle size={40} /><h3>No profile data</h3></div>
      ) : (
        <section className="profile-card">
          <div className="profile-card-head">
            <div className="avatar big-avatar">{(profile.name || 'K').slice(0, 1)}</div>
            <div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-role">{profile.role}</div>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="info-tile">
              <UserCircle size={20} />
              <span className="info-label">Name</span>
              <span className="info-value">{profile.name}</span>
            </div>
            <div className="info-tile">
              <ShieldCheck size={20} />
              <span className="info-label">Role</span>
              <span className="info-value">{profile.role}</span>
            </div>
            <div className="info-tile">
              <Building2 size={20} />
              <span className="info-label">Owner</span>
              <span className="info-value">{profile.owner_id || profile.user_id || 'KnowledgeOS'}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
