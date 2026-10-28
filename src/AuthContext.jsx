import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ value, children }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// AuthProvider ke andar user state aur logout function deta hai.
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
