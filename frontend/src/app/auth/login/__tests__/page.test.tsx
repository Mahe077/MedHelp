import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../page'
import { useAuth } from '@/context/auth-context'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

// Mock useAuth
jest.mock('@/context/auth-context', () => ({
    useAuth: jest.fn(),
}))

describe('LoginPage', () => {
    const mockPush = jest.fn()
    const mockLogin = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })
            ; (useAuth as jest.Mock).mockReturnValue({
                login: mockLogin,
                user: null,
                isLoading: false,
                isAuthenticated: false,
            })
    })

    it('renders login form correctly', () => {
        render(<LoginPage />)

        expect(screen.getAllByText(/sign in/i)[0]).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })


    it('successfully logs in with valid credentials', async () => {
        mockLogin.mockResolvedValueOnce({})

        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/^Password$/)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!')
            expect(mockPush).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('redirects to 2FA page when MFA is required', async () => {
        mockLogin.mockResolvedValueOnce({
            sessionId: 'session-123',
            mfaRequired: true,
        })

        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/^Password$/)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/verify-2fa?session=session-123')
        })
    })

    it('displays error message on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

        render(<LoginPage />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/^Password$/)
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

        const passwordInput = screen.getByLabelText(/^Password$/) as HTMLInputElement
        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

        expect(passwordInput.type).toBe('password')

        fireEvent.click(toggleButton)
        expect(passwordInput.type).toBe('text')

        fireEvent.click(toggleButton)
        expect(passwordInput.type).toBe('password')
    })
})
