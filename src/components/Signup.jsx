import { useState } from 'react'
import { apiRequest, authStore } from '../api.js'
import { useAuth } from './AuthContext.jsx'

// Signup form account banata hai.
export default function Signup({ onLogin }) {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Form bhejne par backend se token aur user hasil karo.
  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const data = await apiRequest('/signup', {
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
        <h1>Create your account</h1>
        <p>Sign up to start your task list.</p>
        <form onSubmit={submit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={6} required />
          </label>
          <button className="primary-button auth-submit">Sign up</button>
        </form>
        <p className="auth-switch">
          Already have an account? <button type="button" onClick={onLogin}>Log in</button>
        </p>
      </section>
    </main>
  )
}
