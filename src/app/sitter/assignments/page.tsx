import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JobStatusBadge } from "@/components/ui/badge";
import { StarDisplay } from "@/components/ui/star-rating";
import { submitWorkProofAction } from "@/lib/actions/sitter-actions";
import { jobRepository } from "@/lib/repositories/job-repository";
import { formatDate } from "@/lib/utils";
import { requireRole } from "@/lib/session";

export default async function SitterAssignmentsPage() {
  const session = await requireRole(["SITTER"]);
  const [active, history] = await Promise.all([
    jobRepository.getAssignmentsBySitter(session.sub),
    jobRepository.getJobHistoryBySitter(session.sub),
  ]);

  const upcoming = active.filter((j) => j.status === "FUNDED");
  const awaitingConfirmation = active.filter((j) => j.status === "IN_PROGRESS");

  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">Assignments</h1>

      {/* Active count summary */}
      <div className="flex gap-4 text-sm text-stone-500">
        <span className="font-medium text-stone-900">{active.length}</span> active
        &nbsp;·&nbsp;
        <span>{upcoming.length} upcoming</span>
        &nbsp;·&nbsp;
        <span>{awaitingConfirmation.length} awaiting owner confirmation</span>
      </div>

      {/* Upcoming (FUNDED) */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-stone-400">No upcoming assignments.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {job.pet.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">Owner: {job.owner.name}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
                <form action={submitWorkProofAction} className="mt-4 space-y-3">
                  <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                  <Textarea name="proofText" placeholder="Describe what you completed" required />
                  <Input suppressHydrationWarning name="imageUrl" placeholder="Evidence image URL (optional)" />
                  <Button type="submit">Submit proof of work</Button>
                </form>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Awaiting owner confirmation (IN_PROGRESS) */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Awaiting confirmation</h2>
        {awaitingConfirmation.length === 0 ? (
          <p className="text-sm text-stone-400">No assignments awaiting confirmation.</p>
        ) : (
          <div className="space-y-4">
            {awaitingConfirmation.map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {job.pet.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">Owner: {job.owner.name}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
                <div className="mt-3 space-y-2 text-sm text-stone-500">
                  {job.workProofs.map((proof) => (
                    <div key={proof.id} className="rounded-lg bg-stone-50 border border-stone-200 p-2">
                      <p>{proof.proofText || "Proof submitted"}</p>
                      <p className="mt-1 text-xs text-stone-400">Submitted {formatDate(proof.submittedAt)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-stone-400">Waiting for the owner to review and confirm completion.</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Job history */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-stone-400">No completed jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {job.pet.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">Owner: {job.owner.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <JobStatusBadge status={job.status} />
                    <StarDisplay rating={job.rating} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
