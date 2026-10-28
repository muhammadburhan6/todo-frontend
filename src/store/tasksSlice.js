import { createSlice } from '@reduxjs/toolkit'

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [] },
  reducers: {
    tasksLoaded(state, action) { state.items = action.payload },
    taskAdded(state, action) { state.items.unshift(action.payload) },
    taskUpdated(state, action) {
      const index = state.items.findIndex((task) => task.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload.task
    },
    taskRemoved(state, action) {
      state.items = state.items.filter((task) => task.id !== action.payload)
    },
  },
})

export const { tasksLoaded, taskAdded, taskUpdated, taskRemoved } = tasksSlice.actions
export default tasksSlice.reducer
