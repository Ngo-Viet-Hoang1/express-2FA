import AuthService from '@/api/services/auth.service'
import { AuthContext } from '@/hooks/useAuth'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { type User } from '@/interfaces/auth.types'
import { useEffect, useState } from 'react'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null)
  const [accessToken, setAccessToken] = useLocalStorage<string | null>(
    'access_token',
    null,
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!user && accessToken) {
        setIsLoading(true)
        try {
          const res = await AuthService.me()
          const { success, data } = res.data
          if (success) {
            setUser(data)
          } else {
            setError(res.data?.message ?? 'Failed to fetch user data')
            setAccessToken(null)
          }
        } catch {
          setError('Error fetching user data')
          setAccessToken(null)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [accessToken, user, setAccessToken, setUser])

  const logout = () => {
    setUser(null)
    setAccessToken(null)
  }

  const login = (userData: User, token: string) => {
    setUser(userData)
    setAccessToken(token)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        loading: isLoading,
        error,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
