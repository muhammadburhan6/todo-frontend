import { useState } from 'react'

// Aik task ko complete, edit, ya delete karne ka chhota component.
export default function Task({ task, onToggle, onSave, onDelete, busy }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  // Naya title save hota hai; kamyabi par edit mode band hota hai.
  async function save(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (cleanTitle && await onSave(cleanTitle)) setEditing(false)
  }

  return (
    <li className={`task-row ${task.completed ? 'task-row--complete' : ''} ${busy ? 'task-row--busy' : ''}`}>
      <button className="task-check" onClick={() => onToggle(task)} disabled={busy} aria-label="Toggle complete">
        {task.completed ? '✓' : ''}
      </button>
      {editing ? (
        <form className="edit-form" onSubmit={save}>
          <input value={title} onChange={event => setTitle(event.target.value)} />
          <button className="text-action">Save</button>
          <button type="button" className="text-action muted" onClick={() => { setTitle(task.title); setEditing(false) }}>Cancel</button>
        </form>
      ) : <span className="task-title">{task.title}</span>}
      {!editing && <div className="task-actions">
        <button className="icon-button" onClick={() => setEditing(true)}>Edit</button>
        <button className="icon-button danger" onClick={() => onDelete(task.id)}>Delete</button>
      </div>}
    </li>
  )
}
