import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTask, fetchTasks, removeTask, saveTask } from '../store/tasksSlice.js'
import { useAuth } from './AuthContext.jsx'
import Task from './Task.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const dispatch = useDispatch()
  // Redux se tasks aur unki loading/error halat milti hai.
  const { items, loading, loadError, mutationError, createError, creating, busyIds } = useSelector(state => state.tasks)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')

  // Dashboard khulte hi server se tasks load karo.
  useEffect(() => { dispatch(fetchTasks()) }, [dispatch])

  // Chuna hua filter laga kar task list chhoti karte hain.
  const tasks = items.filter(task =>
    filter === 'all' || (filter === 'active' ? !task.completed : task.completed),
  )

  // Naya task save karo aur input khaali kar do.
  async function createTask(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    try {
      await dispatch(addTask(cleanTitle)).unwrap()
      setTitle('')
      setFilter('all')
    } catch { /* Error Redux state mein dikhaya jata hai. */ }
  }

  // Task edit/toggle ka nateeja Task component ko batata hai.
  async function updateTask(id, changes) {
    try {
      await dispatch(saveTask({ id, changes })).unwrap()
      return true
    } catch {
      return false
    }
  }

  return (
    <main className="app-page">
      <section className="app-panel">
        <header className="app-header">
          <h2>{user?.email}</h2>
          <button onClick={logout}>Log out</button>
        </header>
        <div className="app-content">
          <h1>My tasks</h1>
          <form className="quick-add" onSubmit={createTask}>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add a task" disabled={creating} />
            <button className="primary-button" disabled={creating || !title.trim()}>Add</button>
          </form>
          {createError && <p className="inline-error" role="alert">{createError}</p>}
          <div className="filters">
            {['all', 'active', 'completed'].map(name => (
              <button key={name} onClick={() => setFilter(name)} aria-pressed={filter === name}>{name}</button>
            ))}
          </div>
          {loadError && <p className="load-error" role="alert">{loadError} <button onClick={() => dispatch(fetchTasks())}>Retry</button></p>}
          {mutationError && <p className="mutation-error" role="alert">{mutationError}</p>}
          {loading ? <p>Loading tasks…</p> : tasks.length ? (
            <ul className="task-list">
              {tasks.map(task => (
                <Task key={task.id} task={task} busy={Boolean(busyIds[task.id])}
                  onToggle={item => updateTask(item.id, { completed: !item.completed })}
                  onSave={value => updateTask(task.id, { title: value })}
                  onDelete={id => dispatch(removeTask(id))} />
              ))}
            </ul>
          ) : <p className="empty-state">No tasks yet.</p>}
        </div>
      </section>
    </main>
  )
}
