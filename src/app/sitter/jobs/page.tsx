import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { applyJobAction } from "@/lib/actions/sitter-actions";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function SitterJobsPage() {
  const session = await requireRole(["SITTER"]);
  const [profile, jobs] = await Promise.all([
    prisma.sitterProfile.findUnique({ where: { userId: session.sub } }),
    prisma.jobPost.findMany({
      where: { status: { in: ["OPEN", "FUNDED"] } },
      include: { pet: true, owner: true, applications: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">Job board</h1>
      {!profile?.isVerified ? <Card><p className="text-sm text-amber-700">Your profile is not verified yet. You can still explore jobs, but the assignment workflow is intended for verified sitters.</p></Card> : null}
      <div className="space-y-4">
        {jobs.map((job) => {
          const alreadyApplied = job.applications.some((application) => application.sitterId === session.sub);
          return (
            <Card key={job.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{job.owner.name} · {job.pet.name} · {formatDate(job.startDate)}</p>
                  <p className="mt-3 text-sm text-stone-600">{job.description}</p>
                </div>
                <div className="min-w-72">
                  {alreadyApplied ? (
                    <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm">You already applied to this job.</p>
                  ) : (
                    <form action={applyJobAction} className="space-y-3">
                      <input type="hidden" name="jobPostId" value={job.id} />
                      <Textarea name="message" placeholder="Short application message" />
                      <Button type="submit">Apply</Button>
                    </form>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
