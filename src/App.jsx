import { useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, authStore } from './api.js'

const FILTERS = ['all', 'active', 'completed']

// Chhote SVG icons ek jagah rakhne se JSX readable rehta hai.
function Icon({ name, size = 18 }) {
  const icons = {
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17.8 17.8 0 0 1-2 2.7M6.7 6.7C3.7 8.5 2 12 2 12s3.5 6 10 6a10.5 10.5 0 0 0 4.2-.9" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    retry: (
      <>
        <path d="M20 11a8 8 0 1 0-2.3 5.7" />
        <path d="M20 4v7h-7" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  )
}

// Login aur signup dono isi component mein handle hote hain.
function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setPassword('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    try {
      const endpoint = isSignup ? '/signup' : '/login'
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      // Token save hota hai taa-ke refresh ke baad user logged in rahe.
      authStore.set(data.token)
      onAuthenticated(data.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-heading">
          <h1 id="auth-title">
            {isSignup ? 'Create your account' : 'Log in'}
          </h1>
          <p>
            {isSignup
              ? 'Sign up to start your task list.'
              : 'Log in to see your tasks.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <span className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                disabled={submitting}
              />
              <button
                type="button"
                className="icon-button password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} />
              </button>
            </span>
          </label>

          <button className="primary-button auth-submit" disabled={submitting}>
            {submitting ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
          <button type="button" onClick={switchMode}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </section>
    </main>
  )
}

// Har Todo item ko display aur edit karne wala component.
function TaskRow({ task, busy, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const editInput = useRef(null)

  // Edit button click hone ke baad input par cursor le aata hai.
  useEffect(() => {
    if (isEditing) editInput.current?.focus()
  }, [isEditing])

  function startEditing() {
    setDraftTitle(task.title)
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraftTitle(task.title)
    setIsEditing(false)
  }

  async function saveTask(event) {
    event.preventDefault()
    const cleanTitle = draftTitle.trim()

    if (!cleanTitle) return
    if (cleanTitle === task.title) {
      setIsEditing(false)
      return
    }

    // Edit mode sirf successful API request ke baad band hota hai.
    const saved = await onUpdate(task.id, { title: cleanTitle })
    if (saved) setIsEditing(false)
  }

  return (
    <li
      className={`task-row ${task.completed ? 'task-row--complete' : ''} ${
        busy ? 'task-row--busy' : ''
      }`}
    >
      <button
        type="button"
        className="task-check"
        aria-label={
          task.completed
            ? `Mark ${task.title} active`
            : `Mark ${task.title} completed`
        }
        aria-pressed={task.completed}
        onClick={() => onToggle(task)}
        disabled={busy}
      >
        {task.completed && <Icon name="check" size={15} />}
      </button>

      <div className="task-main">
        {isEditing ? (
          <form className="edit-form" onSubmit={saveTask}>
            <label className="sr-only" htmlFor={`edit-${task.id}`}>
              Edit task
            </label>
            <input
              ref={editInput}
              id={`edit-${task.id}`}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') cancelEditing()
              }}
            />
            <button className="text-action" disabled={!draftTitle.trim() || busy}>
              Save
            </button>
            <button
              type="button"
              className="text-action muted"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </form>
        ) : (
          <span className="task-title">{task.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className="task-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={`Edit ${task.title}`}
            title="Edit"
            onClick={startEditing}
            disabled={busy}
          >
            <Icon name="edit" />
          </button>
          <button
            type="button"
            className="icon-button danger"
            aria-label={`Delete ${task.title}`}
            title="Delete"
            onClick={() => onDelete(task.id)}
            disabled={busy}
          >
            <Icon name="trash" />
          </button>
        </div>
      )}
    </li>
  )
}

function EmptyState({ filter }) {
  const messages = {
    all: 'No tasks yet.',
    active: 'No active tasks.',
    completed: 'No completed tasks.',
  }

  return <p className="empty-state">{messages[filter]}</p>
}

// Login ke baad Todo workspace yahan render hota hai.
function Workspace({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [busyIds, setBusyIds] = useState(new Set())

  // Page khulte hi backend se tasks load hote hain.
  useEffect(() => {
    let componentIsActive = true

    apiRequest('/tasks')
      .then((items) => {
        if (componentIsActive) setTasks(items)
      })
      .catch((requestError) => {
        if (componentIsActive && requestError.status !== 401) {
          setLoadError(requestError.message)
        }
      })
      .finally(() => {
        if (componentIsActive) setLoading(false)
      })

    return () => {
      componentIsActive = false
    }
  }, [])

  // Filter change hone par sirf matching tasks dikhte hain.
  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed)
    if (filter === 'completed') return tasks.filter((task) => task.completed)
    return tasks
  }, [tasks, filter])

  function markBusy(taskId) {
    setBusyIds((currentIds) => new Set(currentIds).add(taskId))
  }

  function clearBusy(taskId) {
    setBusyIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.delete(taskId)
      return nextIds
    })
  }

  async function loadTasks() {
    setLoading(true)
    setLoadError('')

    try {
      const items = await apiRequest('/tasks')
      setTasks(items)
    } catch (requestError) {
      if (requestError.status !== 401) setLoadError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function createTask(event) {
    event.preventDefault()
    const cleanTitle = newTitle.trim()

    if (!cleanTitle) return

    setCreating(true)
    setCreateError('')

    try {
      const newTask = await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: cleanTitle }),
      })

      setTasks((currentTasks) => [newTask, ...currentTasks])
      setNewTitle('')
      setFilter('all')
    } catch (requestError) {
      if (requestError.status !== 401) setCreateError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  // Title aur completed status dono isi function se update hote hain.
  async function updateTask(taskId, changes) {
    markBusy(taskId)
    setMutationError('')

    try {
      const updatedTask = await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      })

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      )
      return true
    } catch (requestError) {
      if (requestError.status !== 401) setMutationError(requestError.message)
      return false
    } finally {
      clearBusy(taskId)
    }
  }

  async function deleteTask(taskId) {
    markBusy(taskId)
    setMutationError('')

    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' })
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      )
    } catch (requestError) {
      if (requestError.status !== 401) setMutationError(requestError.message)
    } finally {
      clearBusy(taskId)
    }
  }

  return (
    <main className="app-page">
      <section className="app-panel" aria-labelledby="tasks-title">
        <header className="app-header">
          <div className="account">
            <span title={user?.email}>{user?.email}</span>
            <button type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>

        <div className="app-content">
          <h1 id="tasks-title">My tasks</h1>

          <form className="quick-add" onSubmit={createTask}>
            <label className="sr-only" htmlFor="new-task">
              Add a task
            </label>
            <input
              id="new-task"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Add a task"
              disabled={creating}
            />
            <button
              className="primary-button"
              disabled={creating || !newTitle.trim()}
            >
              {creating ? 'Adding…' : 'Add'}
            </button>
          </form>

          {createError && (
            <div className="inline-error" role="alert">
              <span>{createError} Your task text is still here.</span>
              <button type="button" onClick={createTask}>
                Retry
              </button>
            </div>
          )}

          <div className="filters" role="tablist" aria-label="Filter tasks">
            {FILTERS.map((item) => (
              <button
                type="button"
                role="tab"
                aria-selected={filter === item}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          {loadError && (
            <div className="load-error" role="alert">
              <span>{loadError}</span>
              <button type="button" onClick={loadTasks}>
                <Icon name="retry" /> Retry
              </button>
            </div>
          )}

          {mutationError && (
            <div className="mutation-error" role="alert">
              {mutationError} Please try the action again.
            </div>
          )}

          {loading ? (
            <p className="status-text" aria-live="polite">
              Loading tasks…
            </p>
          ) : visibleTasks.length > 0 ? (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  busy={busyIds.has(task.id)}
                  onToggle={(selectedTask) =>
                    updateTask(selectedTask.id, {
                      completed: !selectedTask.completed,
                    })
                  }
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </ul>
          ) : (
            <EmptyState filter={filter} />
          )}
        </div>
      </section>
    </main>
  )
}

// App decide karta hai ke Login screen ya Todo workspace dikhana hai.
export default function App() {
  const [user, setUser] = useState(null)
  const [restoringSession, setRestoringSession] = useState(Boolean(authStore.get()))

  // Saved token ko /me endpoint se verify kiya jata hai.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setRestoringSession(false)
    }

    window.addEventListener('daymark:unauthorized', handleUnauthorized)

    if (authStore.get()) {
      apiRequest('/me')
        .then((data) => setUser(data.user))
        .catch(() => setUser(null))
        .finally(() => setRestoringSession(false))
    }

    return () => {
      window.removeEventListener('daymark:unauthorized', handleUnauthorized)
    }
  }, [])

  function logout() {
    authStore.clear()
    setUser(null)
  }

  if (restoringSession) {
    return (
      <main className="restore-screen">
        <p>Loading…</p>
      </main>
    )
  }

  if (user) return <Workspace user={user} onLogout={logout} />
  return <AuthScreen onAuthenticated={setUser} />
}
