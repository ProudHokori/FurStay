import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await requireRole(["ADMIN"]);
  const [users, jobs, requests] = await Promise.all([
    prisma.user.findMany(),
    prisma.jobPost.findMany(),
    prisma.verificationRequest.findMany(),
  ]);
  return (
    <AppShell role="ADMIN" name={session.name}>
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-stone-500">Users</p><p className="mt-2 text-3xl font-semibold">{users.length}</p></Card>
        <Card><p className="text-sm text-stone-500">Jobs</p><p className="mt-2 text-3xl font-semibold">{jobs.length}</p></Card>
        <Card><p className="text-sm text-stone-500">Verification requests</p><p className="mt-2 text-3xl font-semibold">{requests.length}</p></Card>
      </div>
    </AppShell>
  );
}
