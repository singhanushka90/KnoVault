import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
