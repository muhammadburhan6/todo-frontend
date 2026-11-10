import { useEffect, useState } from 'react'
import { apiRequest, authStore } from './api.js'
import { AuthProvider } from './components/AuthContext.jsx'
import Dashboard from './components/Dashboard.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import { useTheme } from './ThemeContext.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

  function logout() {
    authStore.clear()
    setUser(null)
    setPage('login')
  }

  useEffect(() => {
    let active = true
    const handleUnauthorized = () => {
      if (!active) return
      setUser(null)
      setPage('login')
    }
    window.addEventListener('todo-app:unauthorized', handleUnauthorized)

    async function restoreSession() {
      if (!authStore.get()) {
        if (active) setLoading(false)
        return
      }
      try {
        const data = await apiRequest('/me')
        if (active) setUser(data.user)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    restoreSession()

    return () => {
      active = false
      window.removeEventListener('todo-app:unauthorized', handleUnauthorized)
    }
  }, [])

  return (
    <AuthProvider value={{ user, setUser, logout }}>
      {loading ? <main className="restore-screen">Loading…</main> : user ? (
        <Dashboard theme={theme} toggleTheme={toggleTheme} />
      ) : page === 'signup' ? (
        <Signup onLogin={() => setPage('login')} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <Login onSignup={() => setPage('signup')} theme={theme} toggleTheme={toggleTheme} />
      )}
    </AuthProvider>
  )
}
