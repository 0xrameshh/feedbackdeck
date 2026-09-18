"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { SujhavLogo } from "@/components/sujhav-logo";

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <SujhavLogo size={24} />
          Sujhav
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
