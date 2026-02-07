import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  token: string | null,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Hook for authenticated API calls
export function useApiClient() {
  const { getToken } = useAuth();

  return async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const token = await getToken();
    return apiClient<T>(endpoint, token, options);
  };
}
