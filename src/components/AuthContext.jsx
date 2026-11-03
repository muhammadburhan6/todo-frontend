import { createContext, useContext } from 'react'

// Login user, user update, aur logout function ko pages tak pohanchata hai.
const AuthContext = createContext(null)

// App ka auth data baqi components ko deta hai.
export function AuthProvider({ value, children }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Context se current user aur auth functions hasil karta hai.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
