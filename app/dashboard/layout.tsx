'use client';

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { BarChart3, MessageSquare, Home, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import AuthGuard from "@/components/auth-guard";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false); // Start closed on mobile

  return (
    <AuthGuard>
      <div className="rounded-md flex flex-col md:flex-row bg-muted/50 w-full flex-1 mx-auto border overflow-hidden min-h-screen">
        <Sidebar open={open} setOpen={setOpen} animate={true}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex items-center justify-between px-2 py-4">
                <motion.div
                  animate={{ opacity: open ? 1 : 0 }}
                  className="font-bold text-xl"
                >
                  {open && "FeedbackStar"}
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(!open)}
                  className="ml-auto hidden md:flex h-10 w-10"
                >
                  {open ? (
                    <PanelLeftClose className="h-8 w-8" />
                  ) : (
                    <PanelLeft className="h-8 w-8" />
                  )}
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex-1 overflow-hidden">
          <div className="p-4 md:p-10 rounded-tl-2xl border bg-background flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}