"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/lib/types/user";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  status: "loading" | "authenticated" | "anonymous";
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "anonymous">("loading");
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { user } = await fetchApi("/api/auth/me");
          setUser(user);
          setStatus("authenticated");
        } else {
          setStatus("anonymous");
        }
      } catch (e) {
        localStorage.removeItem("token");
        setStatus("anonymous");
      }
    };
    initAuth();

    const handleExpired = () => {
      setUser(null);
      setStatus("anonymous");
      router.push("/login");
    };

    window.addEventListener("auth-expired", handleExpired);
    return () => window.removeEventListener("auth-expired", handleExpired);
  }, [router]);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    setUser(user);
    setStatus("authenticated");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setStatus("anonymous");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
