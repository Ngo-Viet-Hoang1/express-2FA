export const ROUTES = {
  HOME: '/',
  ABOUT: 'about',
  DASHBOARD: 'dashboard',
  AUTH: {
    ROOT: '/auth',
    LOGIN: 'login',
    REGISTER: 'register',
  },
} as const

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  DASHBOARD: 'dashboard',
  LOGIN: '/admin/auth/login',
  AUTH: {
    ROOT: '/admin/auth',
    LOGIN: 'login',
  },
} as const

export type Routes = (typeof ROUTES)[keyof typeof ROUTES]

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'vite-ui-theme',
} as const
