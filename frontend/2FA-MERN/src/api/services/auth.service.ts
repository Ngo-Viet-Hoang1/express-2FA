import instance from '../axios'

class AuthService {
  static register(email: string, password: string, username?: string) {
    return instance.post('/auth/register', { username, email, password })
  }

  static login(email: string, password: string) {
    return instance.post('/auth/login', { email, password })
  }

  static me() {
    return instance.get('/auth/status')
  }
}

export default AuthService
