import { cn } from "@/lib/utils";

type Variant = "default" | "green" | "yellow" | "blue" | "indigo" | "red" | "stone" | "amber";

const variantStyles: Record<Variant, string> = {
  default: "bg-stone-100 text-stone-700",
  green:   "bg-emerald-100 text-emerald-800",
  yellow:  "bg-yellow-100 text-yellow-800",
  blue:    "bg-blue-100 text-blue-800",
  indigo:  "bg-indigo-100 text-indigo-800",
  red:     "bg-red-100 text-red-700",
  stone:   "bg-stone-200 text-stone-500",
  amber:   "bg-amber-100 text-amber-800",
};

export function Badge({ children, variant = "default", className }: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variantStyles[variant], className)}>
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
