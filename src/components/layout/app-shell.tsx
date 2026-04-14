import type { ReactNode } from "react";
import type { Role } from "@/generated/prisma/enums";
import { Sidebar } from "./sidebar";
import { AutoRefresh } from "./auto-refresh";

export function AppShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar role={role} name={name} />
      <AutoRefresh />
      <main className="flex-1 overflow-auto p-6 md:p-8 min-w-0 space-y-6">{children}</main>
    </div>
  );
}
