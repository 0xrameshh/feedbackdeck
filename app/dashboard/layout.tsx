'use client';

import { useState } from "react";
import { BarChart3, MessageSquare, Home, PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import AuthGuard from "@/components/auth-guard";
import { ModeSwitcher } from "@/components/mode-switcher";
import { FeedbackStarLogo } from "@/components/feedbackstar-logo";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Feedback",
    href: "/dashboard/feedback", 
    icon: <MessageSquare className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
  },
];

// Custom Navigation Link Component
function NavLink({ href, icon, label, isActive, isOpen }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isOpen: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
        isActive 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:shadow-sm"
      )}
    >
      <span className={cn(
        "transition-transform duration-200",
        isActive ? "scale-110" : "group-hover:scale-105"
      )}>
        {icon}
      </span>
      
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="font-medium truncate"
        >
          {label}
        </motion.span>
      )}
      
      {/* Active indicator */}
      {isActive && !isOpen && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-foreground rounded-full" />
      )}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        {/* Beautiful Sidebar */}
        <div className={cn(
          "relative flex flex-col bg-white dark:bg-gray-950 border-r border-border transition-all duration-300 ease-in-out shadow-sm",
          open ? "w-64" : "w-16"
        )}>
          {/* Header Section */}
          <div className={cn(
            "flex items-center p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10",
            open ? "justify-between" : "justify-center"
          )}>
            {open ? (
              <>
                {/* Logo Section - Expanded */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group min-w-0">
                    <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors flex-shrink-0">
                      <FeedbackStarLogo size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-bold text-lg text-foreground truncate">
                      FeedbackStar
                    </span>
                  </Link>
                </motion.div>

                {/* Toggle Button - Expanded */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                  }}
                  className="h-8 w-8 p-0 hover:bg-primary/10 rounded-lg transition-all duration-200 flex-shrink-0"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </>
            ) : (
              /* Collapsed - Only toggle button */
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(!open);
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-lg transition-all duration-200"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-hidden">
            {links.map((link, idx) => (
              <NavLink
                key={idx}
                href={link.href}
                icon={link.icon}
                label={link.label}
                isActive={pathname === link.href}
                isOpen={open}
              />
            ))}
            
            {/* Navigation section divider when expanded */}
            {open && (
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.1 }}
                className="my-6 mx-3 h-px bg-border origin-left"
              />
            )}
          </nav>

          {/* Bottom Section - Logout */}
          <div className="p-3 border-t border-border bg-muted/20">
            <Button
              variant="ghost"
              onClick={signOut}
              className={cn(
                "w-full justify-start gap-3 px-3 py-3 rounded-xl",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10 transition-all duration-200",
                "group relative overflow-hidden"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium truncate"
                >
                  Logout
                </motion.span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 border-b border-border shadow-sm">
            <div className="flex items-center gap-4">
              {/* Mobile menu button - only show on mobile when sidebar is closed */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="md:hidden h-8 w-8 p-0"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <ModeSwitcher />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}