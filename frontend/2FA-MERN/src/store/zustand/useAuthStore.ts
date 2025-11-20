import AuthService from '@/api/services/auth.service'
import { type AuthActions, type AuthState } from '@/interfaces/auth.types'
import { storage } from '@/utils/local-storage.util'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  isInitialized: false,
}

const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initFromStorage: () => {
        const user = storage.getUser()
        const accessToken = storage.getAccessToken()

        set(
          {
            user,
            accessToken,
            isInitialized: true,
          },
          false,
          'auth/initFromStorage',
        )

        if (accessToken && !user) get().fetchUser()
      },

      setUser: (user) => {
        storage.setUser(user)
        set({ user }, false, 'auth/setUser')
      },

      setAccessToken: (token) => {
        storage.setAccessToken(token)
        set({ accessToken: token }, false, 'auth/setAccessToken')
        if (token && !get().user && !get().loading) get().fetchUser()
      },

      login: (userData, token) => {
        storage.setUser(userData)
        storage.setAccessToken(token)
        set(
          { user: userData, accessToken: token, error: null },
          false,
          'auth/login',
        )
      },

      logout: () => {
        storage.clear()
        set({ ...initialState, isInitialized: true }, false, 'auth/logout')
      },

      fetchUser: async () => {
        const { accessToken, user, loading } = get()

        if (loading || user || !accessToken) {
          return
        }

        set({ loading: true }, false, 'auth/fetchUser/loading')

        try {
          const res = await AuthService.me()
          const { success, data, message } = res.data

          if (success && data) {
            storage.setUser(data)
            set(
              {
                user: data,
                error: null,
                loading: false,
              },
              false,
              'auth/fetchUser/success',
            )
          } else {
            const errorMsg = message ?? 'Failed to fetch user data'
            storage.clear()
            set(
              {
                user: null,
                accessToken: null,
                error: errorMsg,
                loading: false,
              },
              false,
              'auth/fetchUser/error',
            )
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Error fetching user data'
          storage.clear()
          set(
            {
              user: null,
              accessToken: null,
              error: errorMsg,
              loading: false,
            },
            false,
            'auth/fetchUser/catch',
          )
        }
      },

      clearError: () => {
        set({ error: null }, false, 'auth/clearError')
      },
    }),
    {
      name: 'AuthStore',
      enabled: import.meta.env.VITE_NODE_ENV === 'development',
    },
  ),
)

export default useAuthStore
