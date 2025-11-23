import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

// Mock the auth API
jest.mock('@/lib/apis/auth', () => ({
    apiLogin: jest.fn(),
}))

describe('LoginPage', () => {
    const mockPush = jest.fn()
    const mockApiLogin = require('@/lib/apis/auth').apiLogin

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })
    })

    it('renders login form correctly', () => {
        render(<LoginPage />)

        expect(screen.getByText(/sign in/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('displays validation errors for empty fields', async () => {
        render(<LoginPage />)

        const submitButton = screen.getByRole('button', { name: /sign in/i })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument()
            expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        })
    })

    it('displays validation error for invalid email', async () => {
        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.blur(emailInput)

        await waitFor(() => {
            expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
        })
    })

    it('successfully logs in with valid credentials', async () => {
        const mockLoginResponse = {
            accessToken: 'mock-token',
            user: {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
            },
            mfaRequired: false,
        }

        mockApiLogin.mockResolvedValueOnce(mockLoginResponse)

        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockApiLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'Password123!',
            })
            expect(mockPush).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('redirects to 2FA page when MFA is required', async () => {
        const mockLoginResponse = {
            sessionId: 'session-123',
            mfaRequired: true,
        }

        mockApiLogin.mockResolvedValueOnce(mockLoginResponse)

        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/verify-2fa?sessionId=session-123')
        })
    })

    it('displays error message on login failure', async () => {
        mockApiLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
        })
    })

    it('toggles password visibility', () => {
        render(<LoginPage />)

        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

        expect(passwordInput.type).toBe('password')

        fireEvent.click(toggleButton)
        expect(passwordInput.type).toBe('text')

        fireEvent.click(toggleButton)
        expect(passwordInput.type).toBe('password')
    })
})
