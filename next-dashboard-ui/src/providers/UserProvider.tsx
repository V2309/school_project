// providers/UserProvider.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { User } from "@prisma/client";

interface UserContextType {
  user: User | null;
  error: string | null;
  loading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user?full=true");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setUser(null);
        return;
      }

      setUser(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user information");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for login events
    const handleLogin = () => {
      fetchUser();
    };

    window.addEventListener("user-logged-in", handleLogin);

    return () => {
      window.removeEventListener("user-logged-in", handleLogin);
    };
  }, [fetchUser]);

  const refetchUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, error, loading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}