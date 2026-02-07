"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Agency {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface CreateAgencyInput {
  name: string;
  slug: string;
}

interface UserStatus {
  user: {
    id: string;
    email: string;
    role: string | null;
    tenant_id: string | null;
  } | null;
  clerkUserId: string;
  tenantId: string | null;
}

async function fetchWithAuth<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export function useUserStatus() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["user-status"],
    queryFn: async () => {
      const token = await getToken();
      return fetchWithAuth<UserStatus>("/api/me", token);
    },
    enabled: isSignedIn,
    retry: false,
  });
}

export function useCreateAgency() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateAgencyInput) => {
      const token = await getToken();
      return fetchWithAuth<Agency>("/api/agencies", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useAgency(agencyId: string | null) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["agency", agencyId],
    queryFn: async () => {
      const token = await getToken();
      return fetchWithAuth<Agency>(`/api/agencies/${agencyId}`, token);
    },
    enabled: isSignedIn && !!agencyId,
  });
}
