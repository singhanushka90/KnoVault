import { useEffect, useState } from 'react'
import { Users, UserPlus, Trash2 } from 'lucide-react'
import { authApi } from '../api/auth.js'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function TeamMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'HR' })

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

  const handleCreate = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await authApi.createTeamMember(form)
      setSuccess('Team member created successfully')
      setForm({ username: '', email: '', password: '', role: 'HR' })
      await loadMembers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create team member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member?')) return

    try {
      await authApi.deleteTeamMember(id)
      setMembers((prev) => prev.filter((member) => member._id !== id))
      setSuccess('Team member removed')
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete team member')
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
      {success && <div className="success-card">{success}</div>}

      <section className="team-create-wrapper">
        <form className="team-create-form" onSubmit={handleCreate}>
          <div className="form-title">
            <UserPlus size={18} />
            <span>Add a team member</span>
          </div>
          <div className="form-grid">
            <label className="field-group compact-field">
              <span>Name</span>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </label>
            <label className="field-group compact-field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="field-group compact-field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <label className="field-group compact-field">
              <span>Role</span>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
              </select>
            </label>
          </div>
          <button className="primary-button small-button" disabled={saving}>{saving ? 'Creating...' : 'Create member'}</button>
        </form>
      </section>

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
                <button className="delete-button small-delete" onClick={() => handleDelete(member._id)}><Trash2 size={14} /></button>
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
