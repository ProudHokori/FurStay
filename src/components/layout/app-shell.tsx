import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth-actions";
import type { Role } from "@/generated/prisma/enums";

const navByRole: Record<Role, Array<{ href: string; label: string }>> = {
  OWNER: [
    { href: "/owner", label: "Overview" },
    { href: "/owner/pets", label: "Pets" },
    { href: "/owner/jobs", label: "Jobs" },
  ],
  SITTER: [
    { href: "/sitter", label: "Overview" },
    { href: "/sitter/profile", label: "Profile" },
    { href: "/sitter/jobs", label: "Job Board" },
    { href: "/sitter/assignments", label: "Assignments" },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/verifications", label: "Verifications" },
    { href: "/admin/jobs", label: "Moderation" },
    { href: "/admin/sitters", label: "Sitters" },
  ],
};

export function AppShell({ role, name, children }: { role: Role; name: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <Link href="/" className="text-xl font-semibold">FurStay</Link>
          <p className="mt-1 text-sm text-stone-500">Signed in as {name}</p>
          <nav className="mt-6 space-y-2">
            {navByRole[role].map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-stone-100">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-6">
            <button suppressHydrationWarning className="rounded-lg border border-stone-300 px-3 py-2 text-sm">Logout</button>
          </form>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
