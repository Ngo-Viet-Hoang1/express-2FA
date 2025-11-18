import type { AuthState } from '@/interfaces/auth.types'
import { createContext, useContext } from 'react'

export const AuthContext = createContext<AuthState | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export default useAuth
