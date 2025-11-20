import { type User } from '@/interfaces/auth.types'

export const storage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key)
  },

  getJSONItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value)
  },

  setJSONItem: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },

  getUser: (): User | null => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  setUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token')
  },

  setAccessToken: (token: string | null): void => {
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
  },

  clear: (): void => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
  },
}
