import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../api.js'

const requestError = (error) => ({
  message: error.message,
  status: error.status,
})

export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest('/tasks')
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

export const addTask = createAsyncThunk(
  'tasks/add',
  async (title, { rejectWithValue }) => {
    try {
      return await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

export const saveTask = createAsyncThunk(
  'tasks/update',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const task = await apiRequest('/tasks/' + id, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      })
      return { id, task }
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

export const removeTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest('/tasks/' + id, { method: 'DELETE' })
      return id
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

const initialState = {
  items: [],
  loading: false,
  creating: false,
  busyIds: {},
  loadError: '',
  createError: '',
  mutationError: '',
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.loadError = ''
        state.items = []
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        if (action.payload?.status !== 401) {
          state.loadError = action.payload?.message || 'Could not load tasks.'
        }
      })
      .addCase(addTask.pending, (state) => {
        state.creating = true
        state.createError = ''
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.creating = false
        state.items.unshift(action.payload)
      })
      .addCase(addTask.rejected, (state, action) => {
        state.creating = false
        if (action.payload?.status !== 401) {
          state.createError = action.payload?.message || 'Could not add task.'
        }
      })
      .addCase(saveTask.pending, (state, action) => {
        state.busyIds[action.meta.arg.id] = true
        state.mutationError = ''
      })
      .addCase(saveTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload.task
        delete state.busyIds[action.payload.id]
      })
      .addCase(saveTask.rejected, (state, action) => {
        delete state.busyIds[action.meta.arg.id]
        if (action.payload?.status !== 401) {
          state.mutationError = action.payload?.message || 'Could not update task.'
        }
      })
      .addCase(removeTask.pending, (state, action) => {
        state.busyIds[action.meta.arg] = true
        state.mutationError = ''
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload)
        delete state.busyIds[action.payload]
      })
      .addCase(removeTask.rejected, (state, action) => {
        delete state.busyIds[action.meta.arg]
        if (action.payload?.status !== 401) {
          state.mutationError = action.payload?.message || 'Could not delete task.'
        }
      })
  },
})

export default tasksSlice.reducer
