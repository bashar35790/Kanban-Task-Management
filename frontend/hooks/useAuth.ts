"use client";

import { signOut, useSession } from "@/lib/auth-client";

export function useAuth() {
  const { data, isPending, error } = useSession();

  return {
    session: data,
    user: data?.user ?? null,
    isPending,
    error,
    signOut,
  };
}
