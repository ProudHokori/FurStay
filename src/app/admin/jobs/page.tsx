import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { JobStatusBadge } from "@/components/ui/badge";
import { removeJobAction, adminCancelJobAction } from "@/lib/actions/admin-actions";
import { adminRepository } from "@/lib/repositories/admin-repository";
import { formatDate } from "@/lib/utils";
import { requireRole } from "@/lib/session";

export default async function AdminJobsPage() {
  const session = await requireRole(["ADMIN"]);
  const jobs = await adminRepository.getModerationJobs();
  return (
    <AppShell role="ADMIN" name={session.name}>
      <PageHeader
        title="Job moderation"
        description="Review all active job listings. Cancel or remove posts that violate platform rules."
      />
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  Owner: {job.owner.name} · Pet: {job.pet.name} · {formatDate(job.startDate)}
                </p>
                <p className="mt-2 text-sm text-stone-600">{job.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {job.status !== "CANCELLED" && job.status !== "REMOVED" && (
                  <form action={adminCancelJobAction}>
                    <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                    <Button type="submit" style={{ backgroundColor: "var(--fur-clay)" }}>Cancel</Button>
                  </form>
                )}
                {job.status !== "REMOVED" && (
                  <form action={removeJobAction}>
                    <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                    <Button type="submit" style={{ backgroundColor: "var(--danger)" }}>Remove</Button>
                  </form>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
