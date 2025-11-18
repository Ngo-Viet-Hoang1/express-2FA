export interface User {
  id: string
  email: string
  username: string
  roleIds: string[]
  attributes?: Record<string, unknown>
}

export interface AuthState {
  user?: User | null
  loading: boolean
  error?: string | null
  setUser: (user: User | null) => void
  logout?: () => void
  login?: (userData: User, token: string) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
}

export interface Permission {
  resource: string
  action: string
  conditions?: unknown[]
}
