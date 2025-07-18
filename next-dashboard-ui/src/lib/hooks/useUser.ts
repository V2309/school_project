import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  role: string;
}

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

    // Listen for login event to re-fetch user and refresh page
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