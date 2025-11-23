import { CreateUserSchema } from '../validation-schemas'

describe('Validation Schemas', () => {
  describe('CreateUserSchema', () => {
    it('validates a valid user object', () => {
      const validUser = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123@',
        phone: '+1234567890',
        role: 'PATIENT',
      }

      const result = CreateUserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidUser = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'Password123!',
        role: 'PATIENT',
      }

      const result = CreateUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('rejects weak password', () => {
      const invalidUser = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'weak',
        role: 'PATIENT',
      }

      const result = CreateUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password')
      }
    })

    it('rejects short username', () => {
      const invalidUser = {
        username: 'ab',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'PATIENT',
      }

      const result = CreateUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('username')
      }
    })

    it('validates optional fields', () => {
      const userWithOptionals = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123@',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        role: 'PATIENT',
      }

      const result = CreateUserSchema.safeParse(userWithOptionals)
      expect(result.success).toBe(true)
    })
  })
})
