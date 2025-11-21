# Frontend Integration Guide

## Overview

This guide covers integrating the authentication backend with your Next.js 14+ frontend using HttpOnly cookies and modern React patterns.

---

## Architecture

```
Frontend (Next.js 14)
├── Context (AuthProvider)
├── API Client (Axios with interceptors)
├── Auth Pages (login, register, verify, reset, 2FA)
├── Protected Routes (middleware)
└── Settings Pages (security, devices, 2FA)
```

---

## Installation

```bash
cd frontend
npm install axios @fingerprintjs/fingerprintjs qrcode.react react-hot-toast
```

---

## 1. API Client Setup

Create `lib/api/client.ts`:

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add access token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt token refresh (uses HttpOnly cookie)
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Save new access token
        setAccessToken(data.accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        clearAccessToken();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Token management (in-memory only)
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

export default apiClient;
```

---

## 2. Device Fingerprinting

Create `lib/device-fingerprint.ts`:

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise: Promise<string> | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (!fingerprintPromise) {
    fingerprintPromise = (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    })();
  }
  return fingerprintPromise;
}
```

---

## 3. Auth Context

Create `context/AuthContext.tsx`:

```typescript
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

  // Initialize - try to get current user
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await apiClient.post('/auth/refresh');
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (error) {
        // No valid session
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
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
  };

  const verify2FA = async (sessionId: string, code: string) => {
    const { data } = await apiClient.post('/auth/verify-2fa', {
      sessionId,
      code,
    });

    setAccessToken(data.accessToken);
    setUser(data.user);
    toast.success('2FA verified successfully!');
  };

  const register = async (registerData: RegisterData) => {
    await apiClient.post('/auth/register', {
      ...registerData,
      roleId: registerData.roleId || 2, // Default to USER role
      userType: registerData.userType || 'INTERNAL',
    });

    toast.success('Registration successful! Please check your email to verify your account.');
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    clearAccessToken();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    const { data } = await apiClient.get('/auth/me');
    setUser(data);
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
```

---

## 4. Auth Pages

### Login Page - `app/auth/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.mfaRequired) {
        setMfaRequired(true);
        setSessionId(result.sessionId!);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    router.push(`/auth/2fa?session=${sessionId}`);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm space-y-2">
          <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
          <p>
            Don't have an account?{' '}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Register Page - `app/auth/register/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      
      router.push('/auth/verify-email-sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Similar input fields for email, username, password */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 5. Protected Routes Middleware

Create`middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  
  // If trying to access protected route without token
  if (!refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If logged in trying to access auth pages
  if (refreshToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/auth/:path*'],
};
```

---

## 6. 2FA Setup Page

Create `app/settings/security/2fa/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import apiClient from '@/lib/api/client';
import { toast } from 'react-hot-toast';

export default function TwoFactorPage() {
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data } = await apiClient.get('/mfa/status');
    setEnabled(data.enabled);
  };

  const handleSetup = async () => {
    const { data } = await apiClient.get('/mfa/setup');
    setQrCodeUri(data.qrCodeUri);
    setBackupCodes(data.backupCodes);
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiClient.post('/mfa/enable', { code });
      toast.success('2FA enabled successfully!');
      setEnabled(true);
      setQrCodeUri(null);
    } catch (error) {
      toast.error('Invalid code');
    }
  };

  const handleDisable = async () => {
    await apiClient.post('/mfa/disable');
    toast.success('2FA disabled');
    setEnabled(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Two-Factor Authentication</h1>
      
      {enabled ? (
        <div>
          <p className="text-green-600 mb-4">✓ 2FA is enabled</p>
          <button onClick={handleDisable} className="btn btn-danger">
            Disable 2FA
          </button>
        </div>
      ) : qrCodeUri ? (
        <div>
          <p className="mb-4">Scan this QR code with your authenticator app:</p>
          <QRCode value={qrCodeUri} size={200} />
          
          <form onSubmit={handleEnable} className="mt-6">
            <input
              type="text"
              placeholder="Enter code from app"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
              Verify & Enable
            </button>
          </form>

          <div className="mt-6">
            <p className="font-semibold">Backup Codes (save these!):</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {backupCodes.map((code, i) => (
                <code key={i} className="bg-gray-100 p-2">{code}</code>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button onClick={handleSetup} className="btn btn-primary">
          Set up 2FA
        </button>
      )}
    </div>
  );
}
```

---

## 7. Best Practices

### Security
1. **Never store access tokens in localStorage** (XSS vulnerable)
2. **Store only in memory** (as shown in API client)
3. **Refresh tokens in HttpOnly cookies** (backend manages)
4. **Use HTTPS in production**
5. **Implement device fingerprinting**

### UX
1. **Auto-refresh tokens** before expiration
2. **Show loading states** during auth operations
3. **Clear error messages** for users
4. **Redirect after successful login**
5. **Handle 401 gracefully**

---

## Next Steps

1. Implement password reset flow
2. Add device management UI
3. Create security settings page
4. Add email verification page
5. Implement OAuth buttons (Google, Apple)

---

## Complete File Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── 2fa/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── settings/
│   │   └── security/
│   │       ├── page.tsx
│   │       ├── 2fa/page.tsx
│   │       └── devices/page.tsx
│   └── dashboard/
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── api/
│   │   └── client.ts
│   └── device-fingerprint.ts
└── middleware.ts
```

---

## Support
See [API Documentation](./API_AUTHENTICATION.md) for backend endpoints.
