'use client';

import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function HeaderNav() {
  const { isAuthenticated, loading, signOut } = useAuth();

  return (
    <header className="absolute top-0 w-full flex justify-between items-center p-6 z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">FS</span>
        </div>
        <span className="text-xl font-bold">FeedbackStar</span>
      </div>
      <div className="flex items-center gap-4">
        <ModeSwitcher />
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}