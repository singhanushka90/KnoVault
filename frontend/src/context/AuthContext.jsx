import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('knowledgeos_token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await authApi.profile()
        setUser(response.data)
      } catch (error) {
        localStorage.removeItem('knowledgeos_token')
        setToken('')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  const login = async (email, password) => {
    const response = await authApi.login({ email, password })
    const accessToken = response.data.access_token
    localStorage.setItem('knowledgeos_token', accessToken)
    setToken(accessToken)

    const profile = await authApi.profile()
    setUser(profile.data)
    return profile.data
  }

  const signup = async (payload) => {
    await authApi.signup(payload)
  }

  const logout = () => {
    localStorage.removeItem('knowledgeos_token')
    setToken('')
    setUser(null)
  }

  const value = useMemo(() => ({
    token,
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: Boolean(token)
  }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider')
  }
  return context
}
