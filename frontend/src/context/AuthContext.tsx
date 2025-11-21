'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient, { setAccessToken, clearAccessToken } from '@/lib/api/client';
import { getDeviceFingerprint } from '@/lib/device-fingerprint';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    email: string;
    username: string;
    roles: string[];
    permissions: string[];
    branchName: string | null;
    userType: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; sessionId?: string }>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    verify2FA: (sessionId: string, code: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface RegisterData {
    email: string;
    username: string;
    password: string;
    roleId?: number;
    userType?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize - try to refresh token on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data } = await apiClient.post('/auth/refresh');
                setAccessToken(data.accessToken);
                setUser(data.user);
            } catch (error) {
                // No valid session - user needs to login
                clearAccessToken();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const deviceFingerprint = await getDeviceFingerprint();

            const { data } = await apiClient.post('/auth/login', {
                email,
                password,
                deviceFingerprint,
            });

            if (data.mfaRequired) {
                return { mfaRequired: true, sessionId: data.sessionId };
            }

            setAccessToken(data.accessToken);
            setUser(data.user);
            toast.success('Logged in successfully!');
            return {};
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const verify2FA = async (sessionId: string, code: string) => {
        try {
            const { data } = await apiClient.post('/auth/verify-2fa', {
                sessionId,
                code,
            });

            setAccessToken(data.accessToken);
            setUser(data.user);
            toast.success('2FA verified successfully!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid 2FA code';
            toast.error(message);
            throw error;
        }
    };

    const register = async (registerData: RegisterData) => {
        try {
            await apiClient.post('/auth/register', {
                ...registerData,
                roleId: registerData.roleId || 2, // Default to USER role
                userType: registerData.userType || 'INTERNAL',
            });

            toast.success('Registration successful! Please check your email to verify your account.');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAccessToken();
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    const refreshUser = async () => {
        try {
            const { data } = await apiClient.get('/auth/me');
            setUser(data);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, verify2FA, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
