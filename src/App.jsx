import { useEffect, useState } from 'react'
import { apiRequest, authStore } from './api.js'
import { AuthProvider } from './components/AuthContext.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  // Token maujood ho to pehle purana session check hota hai.
  const [loading, setLoading] = useState(Boolean(authStore.get()))

  useEffect(() => {
    // Token expire ho to user ko login screen par wapas bhejte hain.
    function signedOut() {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('todo-app:unauthorized', signedOut)

    // Refresh ke baad token backend se verify hota hai.
    if (authStore.get()) {
      apiRequest('/me')
        .then(data => setUser(data.user))
        .catch(() => authStore.clear())
        .finally(() => setLoading(false))
    }

    return () => window.removeEventListener('todo-app:unauthorized', signedOut)
  }, [])

  // Logout par saved token aur current user dono clear hote hain.
  function logout() {
    authStore.clear()
    setUser(null)
  }

  const auth = { user, setUser, logout }

  // Login/signup sirf logged-out user ko; login ke baad dashboard dikhata hai.
  return (
    <AuthProvider value={auth}>
      {loading ? <main className="restore-screen">Loading…</main> :
        user ? <Dashboard /> :
          page === 'signup' ? <Signup onLogin={() => setPage('login')} /> :
            <Login onSignup={() => setPage('signup')} />}
    </AuthProvider>
  )
}
