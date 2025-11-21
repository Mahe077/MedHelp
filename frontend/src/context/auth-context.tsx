"use client";

import { User } from "@/lib/enums";
import React, {useCallback, useEffect} from "react";
import {initializeApiClient} from "@/lib/api-client";
import { useRouter } from "next/navigation";
import {apiLogin, apiRefresh, apiResetPassword} from "@/lib/apis/auth";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const getAccessToken = useCallback((): string | null => {
    return accessToken;
  }, [accessToken]);

  const getRefreshToken = (): string | null => {
    return sessionStorage.getItem("refreshToken");
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("refreshToken");
    router.push("/auth/login");
  }, [router]);

  useEffect(() => {
    initializeApiClient(getAccessToken, getRefreshToken, logout, setAccessToken);
    const initializeAuth = async () => {
      const storedRefreshToken = getRefreshToken();
      if (storedRefreshToken && storedRefreshToken !== "undefined") {
        try {
          const { accessToken } = await apiRefresh(storedRefreshToken);
          setAccessToken(accessToken);
          const storedUser = sessionStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // You might want to fetch the user profile here as well
          // const user = await apiGetUserProfile(accessToken);
          // setUser(user);
        } catch (error) {
            console.error("Refresh token failed:", error);
          // Not logged in or refresh failed
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [getAccessToken, logout]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, accessToken, refreshToken } = await apiLogin(email, password);
      setUser(user);
      setAccessToken(accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
    finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetToken: string, password: string) => {
    setIsLoading(true);
    try {
      await apiResetPassword(resetToken, password);
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const hasPermission = (permissionName: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permissionName);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some((role) => role.name === roleName);
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
