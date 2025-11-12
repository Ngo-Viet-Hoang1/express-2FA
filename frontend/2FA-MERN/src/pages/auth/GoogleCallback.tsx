import { Spinner } from '@/components/ui/spinner'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Login failed via Google: ' + error)
      navigate('/auth/login?error=' + error)
      return
    }

    if (token) {
      localStorage.setItem('access_token', token)
      navigate('/dashboard')
    } else {
      navigate('/auth/login')
    }
  }, [searchParams, navigate])

  return <Spinner />
}

export default GoogleCallback
