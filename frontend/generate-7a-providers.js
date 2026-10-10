const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
};

write('src/components/providers/AuthProvider.tsx', `
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
`);

write('src/app/layout.tsx', `
import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "CollabPay",
  description: "Run campaigns. Pay creators. Every rupee tracked.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Helps prevent zoom on inputs in iOS
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={\`\${inter.variable} \${sora.variable} font-sans bg-bg text-ink min-h-[100dvh] antialiased selection:bg-primary/20\`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
`);
console.log("Providers and Layout written.");
