import { useState } from 'react'
import { apiRequest, authStore } from '../api.js'
import { useAuth } from './AuthContext.jsx'

// Login form maujooda account kholta hai.
export default function Login({ onSignup }) {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Form bhejne par backend se token aur user hasil karo.
  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      authStore.set(data.token)
      setUser(data.user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Log in</h1>
        <p>Log in to see your tasks.</p>
        <form onSubmit={submit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} required />
          </label>
          <button className="primary-button auth-submit">Log in</button>
        </form>
        <p className="auth-switch">
          Need an account? <button type="button" onClick={onSignup}>Sign up</button>
        </p>
      </section>
    </main>
  )
}
