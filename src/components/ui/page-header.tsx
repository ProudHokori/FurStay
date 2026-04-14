import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 pb-2"
      style={{ borderBottom: "1px solid var(--border-strong)" }}
    >
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--fur-dark)" }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
