import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      suppressHydrationWarning
      className={cn(
        "w-full border px-3 py-2 text-sm outline-none transition",
        "border-[var(--border-strong)] bg-[var(--input)] text-[var(--foreground)]",
        "rounded-[var(--radius-sm)] placeholder:text-[var(--muted-foreground)]",
        "focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
