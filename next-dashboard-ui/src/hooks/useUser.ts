
//lib/hooks/useUser.ts
import { useState, useEffect } from "react";
import type { User } from "@prisma/client";  // dùng type Prisma đã generate

interface UseUserResult {
  user: User | null;
  error: string | null;
  loading: boolean;
}
export const useUser = (): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setUser(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user information");
        setLoading(false);
      }
    };

    fetchUser();

    // lắng nghe event login để refetch
    const handleLogin = () => {
      fetchUser();
    };

    window.addEventListener("user-logged-in", handleLogin);

    return () => {
      window.removeEventListener("user-logged-in", handleLogin);
    };
  }, []);

  return { user, error, loading };
};
