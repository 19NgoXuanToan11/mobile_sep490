/**
 * Production API Base URL
 * Can be overridden via EXPO_PUBLIC_API_URL environment variable
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://iotfarm.onrender.com";

/**
 * Centralized API Configuration
 * Default: Production backend on Render
 * Override via EXPO_PUBLIC_API_URL environment variable
 */
const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/v1/account/login",
      REGISTER: "/api/v1/account/register",
      LOGOUT: "/api/v1/account/logout",
      CURRENT_USER: "/api/v1/account/me",
    },
    PROFILE: {
      GET: "/api/v1/account-profile/profile",
      UPDATE: "/api/v1/account-profile/update",
    },
  },
};

export default API_CONFIG;

// HTTP Client utility
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    timeout: number = API_CONFIG.TIMEOUT
  ) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      body?: any;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
    } = {}
  ): Promise<T> {
    const {
      method = "GET",
      body,
      headers = {},
      requiresAuth = false,
    } = options;

    const url = `${this.baseURL}${endpoint}`;

    // Default headers
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add auth token if required
    if (requiresAuth) {
      const { authStorage } = await import("../lib/storage");
      const token = await authStorage.getAccessToken();
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const finalHeaders = { ...defaultHeaders, ...headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  // Convenience methods
  async get<T>(
    endpoint: string,
    options?: { headers?: Record<string, string>; requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: { headers?: Record<string, string>; requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, ...options });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: { headers?: Record<string, string>; requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, ...options });
  }

  async delete<T>(
    endpoint: string,
    options?: { headers?: Record<string, string>; requiresAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }
}

export const apiClient = new ApiClient();
