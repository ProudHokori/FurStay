import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirectToRoleHome } from "@/lib/route-helpers";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirectToRoleHome(session.role);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <section>
          <p className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">FurStay layered monolith MVP</p>
          <h1 className="text-5xl font-bold tracking-tight">Hire trusted pet sitters through a simple, role-based platform.</h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-600">
            FurStay helps pet owners post care jobs, lets pet sitters apply after verification, and gives admins moderation tools in one full-stack Next.js application.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/login" className="rounded-lg bg-stone-900 px-5 py-3 text-white">Login</Link>
            <Link href="/register" className="rounded-lg border border-stone-300 px-5 py-3">Register</Link>
          </div>
        </section>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Demo accounts</h2>
          <ul className="space-y-3 text-sm text-stone-600">
            <li><strong>Owner</strong>: owner@furstay.local / owner123</li>
            <li><strong>Sitter</strong>: sitter@furstay.local / sitter123</li>
            <li><strong>Admin</strong>: admin@furstay.local / admin123</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
