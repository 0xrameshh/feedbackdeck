'use client';

import { Logout } from "./logout";
import { ModeSwitcher } from "./mode-switcher";
import Link from "next/link";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";

export function Header() {
  return (
    <header className="absolute top-0 right-0 flex justify-between items-center p-4 w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <span className="font-bold">Sujhav</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/feedback">Feedback</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/analytics">Analytics</Link>
          </Button>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Logout />
        <ModeSwitcher />
      </div>
    </header>
  );
}