import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  style,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const baseStyle: CSSProperties = {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
    borderRadius: "var(--radius-sm)",
    ...style,
  };

  return (
    <button
      suppressHydrationWarning
      style={baseStyle}
      className={cn(
        "px-4 py-2 text-sm font-medium transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
