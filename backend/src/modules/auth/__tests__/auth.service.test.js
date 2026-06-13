import { AuthService } from '../services/auth.service.js'

describe('AuthService', () => {
  let authService

  beforeEach(() => {
    authService = new AuthService()
  })

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      const result = await authService.register(userData)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
    })

    it('should fail registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      }

      await expect(authService.register(userData)).rejects.toThrow('Invalid email')
    })

    it('should fail registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      }

      await expect(authService.register(userData)).rejects.toThrow('Password too weak')
    })
  })

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'password123')

      expect(result).toBeDefined()
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
    })

    it('should fail login with invalid email', async () => {
      await expect(authService.login('invalid@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      )
    })

    it('should fail login with invalid password', async () => {
      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('validateToken', () => {
    it('should validate a valid JWT token', async () => {
      const token = 'valid.jwt.token'
      const result = await authService.validateToken(token)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
    })

    it('should reject an invalid JWT token', async () => {
      await expect(authService.validateToken('invalid.token')).rejects.toThrow('Invalid token')
    })
  })
})
