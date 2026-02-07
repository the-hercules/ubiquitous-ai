"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AcceptInvitationInput {
  token: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  accepted_at?: string;
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

export function useAcceptInvitation() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: AcceptInvitationInput) => {
      const token = await getToken();
      return fetchWithAuth<Invitation>("/api/invitations/accept", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}
