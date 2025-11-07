import instance from '../axios'

class AuthService {
  static register(email: string, password: string, username?: string) {
    return instance.post('/auth/register', { username, email, password })
  }
}

export default AuthService
