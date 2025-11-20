export interface User {
  id: string
  email: string
  username: string
  roleIds: string[]
  attributes?: Record<string, unknown>
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  loading: boolean
  error: string | null
  isInitialized: boolean
}

export interface AuthActions {
  initFromStorage: () => void
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  login: (userData: User, token: string) => void
  logout: () => void
  fetchUser: () => Promise<void>
  clearError: () => void
}

export interface Permission {
  resource: string
  action: string
  conditions?: unknown[]
}
