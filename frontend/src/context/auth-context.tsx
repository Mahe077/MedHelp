"use client";

import { User } from "@/lib/enums";
import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/api/client";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; sessionId?: string }>;
  resetPassword: (resetToken: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionName: string) => boolean;
  hasRole: (roleName: string) => boolean;
  getAccessToken: () => string | null;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  // Initialize - try to refresh token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh using HttpOnly cookie
        const { data } = await apiClient.post('/auth/refresh');
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (error) {
        // No valid session - user needs to login
        clearAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ mfaRequired?: boolean; sessionId?: string }> => {
    setIsLoading(true);
    try {
      const deviceFingerprint = await getDeviceFingerprint();

      const { data } = await apiClient.post('/auth/login', {
        email,
        password,
        deviceFingerprint,
      });

      // Check if 2FA is required
      if (data.mfaRequired) {
        setIsLoading(false);
        return { mfaRequired: true, sessionId: data.sessionId };
      }

      // No 2FA - set tokens and user
      setAccessToken(data.accessToken);
      setUser(data.user);
      setIsLoading(false);

      return {};
    } catch (error) {
      setIsLoading(false);
      console.error("Login failed:", error);
      throw error;
    }
  };

  const resetPassword = async (resetToken: string, password: string) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token: resetToken,
        newPassword: password,
      });
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    const performLogout = async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        clearAccessToken();
        setUser(null);
        router.push("/auth/login");
      }
    };

    performLogout();
  }, [router]);

  const hasPermission = (permissionName: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permissionName);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some((role) => role === roleName);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        resetPassword,
        logout,
        hasPermission,
        hasRole,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
