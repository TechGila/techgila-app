import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  User,
  getCurrentUser,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
} from "@/lib/api";

function extractUserFromCurrentUserResponse(response: unknown): User | null {
  if (!response || typeof response !== "object") return null;
  const res = response as Record<string, unknown>;

  const data = res.data;
  const userCandidate =
    (data &&
      typeof data === "object" &&
      (data as Record<string, unknown>).user) ||
    data ||
    res.user;

  if (!userCandidate || typeof userCandidate !== "object") return null;
  const u = userCandidate as Record<string, unknown>;
  if (typeof u.id !== "number") return null;
  if (typeof u.email !== "string") return null;
  if (typeof u.username !== "string") return null;
  if (typeof u.first_name !== "string") return null;
  if (typeof u.last_name !== "string") return null;

  return u as unknown as User;
}

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
      const extractedUser = extractUserFromCurrentUserResponse(response);
      if (response.status === "success" && extractedUser) {
        setUser(extractedUser);
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
      const extractedUser = extractUserFromCurrentUserResponse(response);
      if (response.status === "success" && extractedUser) {
        setUser(extractedUser);
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
