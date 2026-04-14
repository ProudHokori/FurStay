import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "green" | "yellow" | "blue" | "indigo" | "red" | "stone" | "amber";

const variantStyles: Record<Variant, CSSProperties> = {
  default: {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
  },
  green: {
    backgroundColor: "color-mix(in srgb, var(--success) 22%, var(--surface-2))",
    color: "color-mix(in srgb, var(--success) 55%, #000)",
  },
  yellow: {
    backgroundColor: "color-mix(in srgb, var(--warning) 30%, var(--surface-2))",
    color: "color-mix(in srgb, var(--warning) 35%, #000)",
  },
  blue: {
    backgroundColor: "color-mix(in srgb, var(--info) 18%, var(--surface-2))",
    color: "var(--info)",
  },
  indigo: {
    backgroundColor: "color-mix(in srgb, var(--info) 18%, var(--surface-2))",
    color: "var(--info)",
  },
  red: {
    backgroundColor: "color-mix(in srgb, var(--danger) 22%, var(--surface-2))",
    color: "color-mix(in srgb, var(--danger) 65%, #000)",
  },
  stone: {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
  },
  amber: {
    backgroundColor: "color-mix(in srgb, var(--fur-beige) 55%, var(--surface-2))",
    color: "var(--fur-brown)",
  },
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}

// Convenience helpers for domain enums
export function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    OPEN:        "green",
    WAITING:     "yellow",
    FUNDED:      "blue",
    IN_PROGRESS: "indigo",
    COMPLETED:   "default",
    CANCELLED:   "red",
    REMOVED:     "stone",
  };
  return <Badge variant={map[status] ?? "default"}>{status.replace("_", " ")}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    PENDING:   "yellow",
    ACCEPTED:  "green",
    REJECTED:  "red",
    WITHDRAWN: "stone",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}

export function VerificationStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    PENDING:  "amber",
    APPROVED: "green",
    REJECTED: "red",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}
