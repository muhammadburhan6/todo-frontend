import { useState } from 'react'
import { apiRequest, authStore } from '../api.js'
import { useAuth } from './AuthContext.jsx'

export default function Login({ onSignup, theme, toggleTheme }) {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      authStore.set(data.token)
      setUser(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <button className="theme-toggle theme-switch" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
      </button>
      <section className="auth-card">
        <h1>Log in</h1>
        <p>Log in to see your tasks.</p>
        <form onSubmit={submit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label className="field"><span>Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="field"><span>Password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" minLength={6} required /></label>
          <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : 'Log in'}</button>
        </form>
        <p className="auth-switch">Need an account? <button type="button" onClick={onSignup}>Sign up</button></p>
      </section>
    </main>
  )
}
