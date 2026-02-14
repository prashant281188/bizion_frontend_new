"use client";

import { getMe } from "@/lib/api/auth";
import { User } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface AuthContextType {
  user?: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: true,
  user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  const value: AuthContextType = {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
