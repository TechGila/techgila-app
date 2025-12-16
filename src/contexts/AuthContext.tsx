import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, getCurrentUser, setAuthToken, getAuthToken, removeAuthToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  completeOAuthLogin: (token: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      if (response.status === "success" && response.data?.user) {
        setUser(response.data.user);
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch {
      removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
  }, []);

  const completeOAuthLogin = useCallback(async (token: string) => {
    setIsLoading(true);
    setAuthToken(token);

    try {
      const response = await getCurrentUser();
      if (response.status === "success" && response.data?.user) {
        setUser(response.data.user);
        return true;
      }

      removeAuthToken();
      setUser(null);
      return false;
    } catch {
      removeAuthToken();
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        completeOAuthLogin,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
