import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { removeJobAction } from "@/lib/actions/admin-actions";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function AdminJobsPage() {
  const session = await requireRole(["ADMIN"]);
  const jobs = await prisma.jobPost.findMany({ include: { owner: true, pet: true }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell role="ADMIN" name={session.name}>
      <h1 className="text-3xl font-bold">Job moderation</h1>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="mt-1 text-sm text-stone-500">Owner: {job.owner.name} · Pet: {job.pet.name} · {formatDate(job.startDate)}</p>
                <p className="mt-3 text-sm text-stone-600">{job.description}</p>
              </div>
              {job.status !== "REMOVED" ? (
                <form action={removeJobAction}>
                  <input type="hidden" name="jobPostId" value={job.id} />
                  <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600">Remove</button>
                </form>
              ) : <span className="text-sm text-red-600">Removed</span>}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
