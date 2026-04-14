import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-app border border-app-strong bg-surface-2 p-5 shadow-app", className)}
    >
      {children}
    </div>
  );
}
