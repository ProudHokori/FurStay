import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function SitterDashboardPage() {
  const session = await requireRole(["SITTER"]);
  const [profile, applications, assignments] = await Promise.all([
    prisma.sitterProfile.findUnique({ where: { userId: session.sub } }),
    prisma.jobApplication.findMany({ where: { sitterId: session.sub } }),
    prisma.jobPost.findMany({ where: { selectedSitterId: session.sub } }),
  ]);
  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">Sitter dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-stone-500">Verified</p><p className="mt-2 text-3xl font-semibold">{profile?.isVerified ? "Yes" : "No"}</p></Card>
        <Card><p className="text-sm text-stone-500">Applications</p><p className="mt-2 text-3xl font-semibold">{applications.length}</p></Card>
        <Card><p className="text-sm text-stone-500">Assignments</p><p className="mt-2 text-3xl font-semibold">{assignments.length}</p></Card>
      </div>
    </AppShell>
  );
}
