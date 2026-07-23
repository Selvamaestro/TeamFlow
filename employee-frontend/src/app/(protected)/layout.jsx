"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
          <p className="font-label-md text-label-md text-on-surface-variant">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect above is in-flight; render nothing rather than flashing protected content.
    return null;
  }

  return children;
}
