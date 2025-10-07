"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  fallback?: ReactNode;
}

interface SessionUser {
  systemRole?: string;
}

interface Session {
  user?: SessionUser;
}

export function AdminGuard({
  children,
  requireSuperAdmin = false,
  fallback = <div>Access denied</div>
}: AdminGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const sessionData: Session = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.error("Failed to check session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
      return;
    }

    if (!isLoading && session) {
      const userRole = session.user?.systemRole;

      if (requireSuperAdmin && userRole !== "super_admin") {
        router.push("/dashboard");
        return;
      }

      if (userRole !== "admin" && userRole !== "super_admin") {
        router.push("/dashboard");
        return;
      }
    }
  }, [session, isLoading, router, requireSuperAdmin]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <>{fallback}</>;
  }

  const userRole = session.user?.systemRole;

  if (requireSuperAdmin && userRole !== "super_admin") {
    return <>{fallback}</>;
  }

  if (userRole !== "admin" && userRole !== "super_admin") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}