import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { adminRepository } from "@/lib/repositories/admin-repository";
import { requireRole } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await requireRole(["ADMIN"]);
  const stats = await adminRepository.getDashboardStats();
  return (
    <AppShell role="ADMIN" name={session.name}>
      <PageHeader
        title="Admin dashboard"
        description="Platform overview — monitor users, sitters, jobs, and pending verifications."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-stone-500">Total users</p><p className="mt-2 text-3xl font-semibold">{stats.users}</p></Card>
        <Card><p className="text-sm text-stone-500">Sitters</p><p className="mt-2 text-3xl font-semibold">{stats.sitters}</p></Card>
        <Card><p className="text-sm text-stone-500">Total jobs</p><p className="mt-2 text-3xl font-semibold">{stats.jobs}</p></Card>
        <Card>
          <p className="text-sm text-stone-500">Pending verifications</p>
          <p className="mt-2 text-3xl font-semibold">{stats.pendingVerifications}</p>
          {stats.pendingVerifications > 0 && <p className="mt-1 text-xs text-amber-600 font-medium">Needs review</p>}
        </Card>
      </div>
    </AppShell>
  );
}
