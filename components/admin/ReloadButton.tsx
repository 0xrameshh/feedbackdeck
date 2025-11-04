"use client";

import { Button } from "@/components/ui/button";

export default function ReloadButton({ className }: { className?: string }) {
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => window.location.reload()}
    >
      Try Again
    </Button>
  );
}

