import { Spinner } from '@/components/ui/spinner'
import useAuthStore from '@/store/zustand/useAuthStore'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

function GoogleCallback() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (!error && !token) {
      navigate('/auth/login')
      return
    }

    if (error) {
      toast.error('Login failed via Google: ' + error)
      navigate('/auth/login?error=' + error)
      return
    }

    if (token) {
      setAccessToken(token)
      toast.success('Login successful via Google!')
      navigate('/dashboard')
    } else {
      navigate('/auth/login')
    }
  }, [searchParams, navigate, setAccessToken])

  return <Spinner />
}

export default GoogleCallback
