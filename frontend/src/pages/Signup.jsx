import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.js'
import Loading from '../components/Loading.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await authApi.signup(form)
      setSuccess('Account created successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 700)
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <div className="brand-icon large">K</div>
          <div>
            <div className="brand-name auth-brand">Create account</div>
            <div className="auth-subtitle">KnowledgeOS</div>
          </div>
        </div>

        {error && <div className="error-card">{error}</div>}
        {success && <div className="success-card">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Name</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="primary-button full" disabled={busy}>{busy ? <Loading label="Creating account..." /> : 'Create account'}</button>
        </form>

        <div className="auth-links">
          <span>Already a member?</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
