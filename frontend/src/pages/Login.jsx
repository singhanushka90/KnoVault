import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Loading from '../components/Loading.jsx'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="auth-header">
          <div className="brand-icon large">K</div>
          <div>
            <div className="brand-name auth-brand">KnowledgeOS</div>
            <div className="auth-subtitle">Welcome back</div>
          </div>
        </div>

        {error && <div className="error-card">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="primary-button full" disabled={busy}>{busy ? <Loading label="Signing in..." /> : 'Login'}</button>
        </form>

        <div className="auth-links">
          <span>No account?</span>
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  )
}
