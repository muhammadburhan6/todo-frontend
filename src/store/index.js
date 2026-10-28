import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from './tasksSlice.js'

export const store = configureStore({ reducer: { tasks: tasksReducer } })
