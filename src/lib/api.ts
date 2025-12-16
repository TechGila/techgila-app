// API Configuration and utilities for TechGila
const API_BASE_URL = "https://api.techgila.com";

export type OAuthProvider = "google" | "github";

export function getOAuthRedirectUrl(provider: OAuthProvider): string {
  return `${API_BASE_URL}/auth/${provider}/redirect`;
}

// SHA-256 password hashing utility
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Token management
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

// API Response types
export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  code: number;
  timestamp: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
  email_verified_at: string | null;
  current_plan: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

// Generic API fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Network error",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

// Auth API calls
export async function register(
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<ApiResponse<AuthData>> {
  const passwordHash = await hashPassword(password);
  return apiFetch<AuthData>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      password_hash_confirmation: passwordHash,
    }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthData>> {
  const passwordHash = await hashPassword(password);
  return apiFetch<AuthData>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password_hash: passwordHash,
    }),
  });
}

export async function logout(): Promise<ApiResponse<void>> {
  const result = await apiFetch<void>("/auth/logout", {
    method: "POST",
  });
  removeAuthToken();
  return result;
}

// User profile
export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  return apiFetch<{ user: User }>("/user");
}

export async function updateProfile(
  data: Partial<Pick<User, "username" | "first_name" | "last_name" | "email">>
): Promise<ApiResponse<{ user: User }>> {
  return apiFetch<{ user: User }>("/user", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(
  file: File
): Promise<ApiResponse<{ user: User }>> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Upload failed",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

// Password management
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  const currentPasswordHash = await hashPassword(currentPassword);
  const newPasswordHash = await hashPassword(newPassword);
  return apiFetch<void>("/auth/password/change", {
    method: "POST",
    body: JSON.stringify({
      current_password_hash: currentPasswordHash,
      new_password_hash: newPasswordHash,
      new_password_hash_confirmation: newPasswordHash,
    }),
  });
}

export async function forgotPassword(
  email: string
): Promise<ApiResponse<void>> {
  return apiFetch<void>("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Payments
export interface Payment {
  id: number;
  transaction_id: string;
  gateway: string;
  amount: string;
  currency: string;
  status: string;
  type: string;
  plan_name?: string;
  card_last_four: string;
  card_brand: string;
  description?: string;
  paid_at: string;
  created_at: string;
}

export async function getPayments(): Promise<
  ApiResponse<{ payments: Payment[] }>
> {
  return apiFetch<{ payments: Payment[] }>("/payments");
}

export async function getLastPlan(): Promise<
  ApiResponse<{ plan: SubscriptionPlan; payment: Payment }>
> {
  return apiFetch<{ plan: SubscriptionPlan; payment: Payment }>(
    "/payments/last-plan"
  );
}

// Subscription Plans
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  trial_days: number;
  features: string[];
  is_active: boolean;
}

export async function subscribeToplan(
  planSlug: string,
  paymentMethod: {
    card_number: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
    card_holder: string;
  }
): Promise<ApiResponse<{ payment: Payment; user: User }>> {
  return apiFetch<{ payment: Payment; user: User }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_slug: planSlug,
      payment_method: paymentMethod,
    }),
  });
}

export async function getSubscriptionPlans(): Promise<
  ApiResponse<{ plans: SubscriptionPlan[] }>
> {
  return apiFetch<{ plans: SubscriptionPlan[] }>("/subscription-plans");
}

export async function createSubscriptionPlan(
  plan: Omit<SubscriptionPlan, "id">
): Promise<ApiResponse<{ plan: SubscriptionPlan }>> {
  return apiFetch<{ plan: SubscriptionPlan }>("/subscription-plans", {
    method: "POST",
    body: JSON.stringify(plan),
  });
}

// AI endpoints
export interface AIGenerateResult {
  result: string;
  tokens_used: number;
  model: string;
  request_id: string;
}

export async function generateAI(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<ApiResponse<AIGenerateResult>> {
  return apiFetch<AIGenerateResult>("/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      ...options,
    }),
  });
}

// Verification
export async function sendVerificationEmail(): Promise<ApiResponse<void>> {
  return apiFetch<void>("/auth/verify/send", {
    method: "POST",
  });
}
