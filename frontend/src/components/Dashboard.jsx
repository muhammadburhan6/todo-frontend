import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTask, fetchTasks, removeTask, saveTask } from '../store/tasksSlice.js'
import { useAuth } from './AuthContext.jsx'

export default function Dashboard({ theme, toggleTheme }) {
  const { user, logout } = useAuth()
  const dispatch = useDispatch()
  const { items, loading, loadError, mutationError, createError, creating, busyIds } = useSelector(state => state.tasks)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')

  useEffect(() => { dispatch(fetchTasks()) }, [dispatch])

  const tasks = items.filter(task =>
    filter === 'all' || (filter === 'active' ? !task.completed : task.completed),
  )

  async function createTask(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    try {
      await dispatch(addTask(cleanTitle)).unwrap()
      setTitle('')
    } catch { /* Error Redux state mein dikhaya jata hai. */ }
  }

  async function updateTask(id, changes) {
    try {
      await dispatch(saveTask({ id, changes })).unwrap()
      return true
    } catch {
      return false
    }
  }

  async function saveTitle(event, task) {
    event.preventDefault()
    const cleanTitle = draft.trim()
    if (!cleanTitle) return
    if (await updateTask(task.id, { title: cleanTitle })) setEditingId(null)
  }

  return (
    <main className="app-page">
      <section className="app-panel">
        <header className="app-header">
          <div className="account">
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
            </button>
            <span>{user?.email}</span>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        </header>
        <div className="app-content">
          <h1>My tasks</h1>
          <form className="quick-add" onSubmit={createTask}>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add a task" disabled={creating} maxLength={300} required />
            <button className="primary-button" disabled={creating || !title.trim()}>{creating ? 'Saving…' : 'Add task'}</button>
          </form>
          {createError && <p className="inline-error" role="alert">{createError}</p>}
          <div className="filters" role="tablist" aria-label="Filter tasks">
            {['all', 'active', 'completed'].map(name => (
              <button key={name} type="button" role="tab" onClick={() => setFilter(name)} aria-selected={filter === name}>
                {name[0].toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>
          {loadError && <p className="load-error" role="alert">{loadError} <button type="button" onClick={() => dispatch(fetchTasks())}>Retry</button></p>}
          {mutationError && <p className="mutation-error" role="alert">{mutationError}</p>}
          {loading ? <p>Loading tasks…</p> : tasks.length ? (
            <ul className="task-list">
              {tasks.map(task => (
                <li key={task.id} className={`task-row${task.completed ? ' task-row--complete' : ''}${busyIds[task.id] ? ' task-row--busy' : ''}`}>
                  <button className="task-check" type="button" onClick={() => updateTask(task.id, { completed: !task.completed })} disabled={Boolean(busyIds[task.id])} aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`} aria-pressed={Boolean(task.completed)}>
                    {task.completed ? '✓' : ''}
                  </button>
                  {editingId === task.id ? (
                    <form className="edit-form" onSubmit={event => saveTitle(event, task)}>
                      <label className="sr-only" htmlFor={`edit-task-${task.id}`}>Edit task</label>
                      <input id={`edit-task-${task.id}`} value={draft} onChange={event => setDraft(event.target.value)} maxLength={300} autoFocus required disabled={Boolean(busyIds[task.id])} />
                      <button className="text-action" type="submit" disabled={Boolean(busyIds[task.id]) || !draft.trim()}>Save</button>
                      <button className="text-action muted" type="button" onClick={() => setEditingId(null)} disabled={Boolean(busyIds[task.id])}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span className="task-title">{task.title}</span>
                      <div className="task-actions">
                        <button className="icon-button" type="button" onClick={() => { setDraft(task.title); setEditingId(task.id) }} disabled={Boolean(busyIds[task.id])} aria-label={`Edit ${task.title}`}>Edit</button>
                        <button className="icon-button danger" type="button" onClick={() => dispatch(removeTask(task.id))} disabled={Boolean(busyIds[task.id])} aria-label={`Delete ${task.title}`}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="empty-state">{items.length === 0 ? 'No tasks yet. Add your first one above.' : filter === 'active' ? 'No active tasks.' : 'No completed tasks.'}</p>}
        </div>
      </section>
    </main>
  )
}
