import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { petRepository } from "@/lib/repositories/pet-repository";
import { jobRepository } from "@/lib/repositories/job-repository";
import { requireRole } from "@/lib/session";

export default async function OwnerDashboardPage() {
  const session = await requireRole(["OWNER"]);
  const [pets, jobs] = await Promise.all([
    petRepository.getByOwner(session.sub),
    jobRepository.getOwnerJobs(session.sub),
  ]);
  return (
    <AppShell role="OWNER" name={session.name}>
      <PageHeader
        title="Owner dashboard"
        description="Manage your pets and track the jobs you've posted."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-stone-500">Pets</p><p className="mt-2 text-3xl font-semibold">{pets.length}</p></Card>
        <Card><p className="text-sm text-stone-500">Jobs posted</p><p className="mt-2 text-3xl font-semibold">{jobs.length}</p></Card>
        <Card><p className="text-sm text-stone-500">Open jobs</p><p className="mt-2 text-3xl font-semibold">{jobs.filter((j) => j.status === "OPEN").length}</p></Card>
      </div>
    </AppShell>
  );
}
