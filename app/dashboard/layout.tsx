'use client';

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { BarChart3, MessageSquare, Home, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Feedback",
    href: "/dashboard/feedback", 
    icon: <MessageSquare className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false); // Start closed on mobile

  return (
    <div className="rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden min-h-screen">
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between px-2 py-4">
              <motion.div
                animate={{ opacity: open ? 1 : 0 }}
                className="font-bold text-xl text-neutral-700 dark:text-neutral-200"
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
                  <PanelLeftClose className="h-8 w-8 text-neutral-700 dark:text-neutral-200" />
                ) : (
                  <PanelLeft className="h-8 w-8 text-neutral-700 dark:text-neutral-200" />
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
        <div className="p-4 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}