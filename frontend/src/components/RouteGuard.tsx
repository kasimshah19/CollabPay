"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function RouteGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ("brand" | "creator")[] }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    const isPublicPath = pathname === "/" || pathname === "/login" || pathname === "/signup";

    if (status === "anonymous" && !isPublicPath) {
      router.replace("/login");
    } else if (status === "authenticated" && isPublicPath) {
      router.replace(`/${user?.role}`);
    } else if (status === "authenticated" && allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace(`/${user.role}`);
    }
  }, [status, pathname, router, allowedRoles, user]);

  if (status === "loading") {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-bg">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  // Still show loading if unauthorized so it doesn't flash before redirecting
  if (status === "anonymous" && pathname !== "/" && pathname !== "/login" && pathname !== "/signup") {
    return null;
  }

  if (status === "authenticated" && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
