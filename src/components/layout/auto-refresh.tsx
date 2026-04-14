"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Silently refreshes Server Component data every `intervalMs` milliseconds.
// This keeps all pages in sync across roles without a full page reload.
export function AutoRefresh({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
