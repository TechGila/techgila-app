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

  // Response shapes can vary (data.user, data, user, or the raw user). Accept all.
  const data = res.data;
  const userCandidate =
    (data &&
      typeof data === "object" &&
      (data as Record<string, unknown>).user) ||
    data ||
    res.user ||
    res;

  if (!userCandidate || typeof userCandidate !== "object") return null;
  const u = userCandidate as Record<string, unknown>;

  // Normalize ID (accept number or numeric string)
  let id: number | null = null;
  if (typeof u.id === "number") id = u.id;
  else if (typeof u.id === "string" && /^\d+$/.test(u.id))
    id = parseInt(u.id, 10);
  else if (typeof u.user_id === "number") id = u.user_id;
  if (id === null) return null;

  // Username: prefer username, then login (GitHub), then fallback to name or generated
  const username =
    (typeof u.username === "string" && u.username) ||
    (typeof u.login === "string" && u.login) ||
    (typeof u.name === "string" && u.name.split(" ")[0]) ||
    `user${id}`;

  // Name: prefer first/last, otherwise split full name if present
  let first_name = "";
  let last_name = "";
  if (typeof u.first_name === "string" || typeof u.last_name === "string") {
    first_name = (u.first_name as string) || "";
    last_name = (u.last_name as string) || "";
  } else if (typeof u.name === "string") {
    const parts = u.name.trim().split(/\s+/);
    first_name = parts.shift() || "";
    last_name = parts.join(" ") || "";
  }

  // Email: accept empty string if not provided (some providers omit email)
  const email = typeof u.email === "string" ? u.email : "";

  // Avatar: handle common provider fields
  const avatar =
    (typeof u.avatar === "string" && u.avatar) ||
    (typeof u.avatar_url === "string" && u.avatar_url) ||
    (typeof u.profile_photo_url === "string" && u.profile_photo_url) ||
    null;

  const email_verified_at =
    typeof u.email_verified_at === "string" ? u.email_verified_at : null;
  const current_plan =
    typeof u.current_plan === "string" ? u.current_plan : null;

  // Build sanitized user object matching our User type as closely as possible
  const normalized: Partial<User> = {
    id,
    username,
    first_name,
    last_name,
    email,
    avatar,
    email_verified_at,
    current_plan,
    created_at: typeof u.created_at === "string" ? u.created_at : undefined,
    updated_at: typeof u.updated_at === "string" ? u.updated_at : undefined,
  };

  // Basic validation: id and username required
  if (
    typeof normalized.id !== "number" ||
    typeof normalized.username !== "string"
  ) {
    return null;
  }

  // Ensure fields expected by our app are present (fill with defaults when missing)
  const finalUser: User = {
    id: normalized.id!,
    username: normalized.username!,
    first_name: normalized.first_name || "",
    last_name: normalized.last_name || "",
    email: normalized.email || "",
    avatar: normalized.avatar ?? null,
    email_verified_at: normalized.email_verified_at ?? null,
    current_plan: normalized.current_plan ?? null,
    created_at: normalized.created_at,
    updated_at: normalized.updated_at,
  };

  return finalUser;
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
  // No development-only auth helpers exposed in production.
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
      // Helpful debug info when OAuth completion fails for a specific provider
      console.debug("completeOAuthLogin: /user response:", response);
      const extractedUser = extractUserFromCurrentUserResponse(response);
      if (response.status === "success" && extractedUser) {
        setUser(extractedUser);
        return true;
      }

      // If we can't parse a valid user, remove token and fail gracefully
      removeAuthToken();
      setUser(null);
      return false;
    } catch (err) {
      console.debug("completeOAuthLogin: error while fetching /user", err);
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
