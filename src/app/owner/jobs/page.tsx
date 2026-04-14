import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JobStatusBadge, ApplicationStatusBadge } from "@/components/ui/badge";
import { StarDisplay } from "@/components/ui/star-rating";
import { NewJobForm } from "./new-job-form";
import { SitterProfileModal } from "./sitter-profile-modal";
import { RateJobForm } from "./rate-job-form";
import {
  confirmCompletionAction,
  confirmPaymentAction,
  cancelJobAction,
  selectSitterAction,
} from "@/lib/actions/owner-actions";
import { jobRepository } from "@/lib/repositories/job-repository";
import { petRepository } from "@/lib/repositories/pet-repository";
import { formatDate } from "@/lib/utils";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";

export default async function OwnerJobsPage() {
  const session = await requireRole(["OWNER"]);
  const [pets, jobs] = await Promise.all([
    petRepository.getByOwner(session.sub),
    jobRepository.getOwnerJobs(session.sub),
  ]);

  // Preload sitter stats for all unique sitters across all jobs
  const sitterIds = [...new Set(
    jobs.flatMap((j) => j.applications.map((a) => a.sitter.id))
  )];
  const statsMap = new Map(
    await Promise.all(sitterIds.map(async (id) => [id, await jobRepository.getSitterStats(id)] as const))
  );

  return (
    <AppShell role="OWNER" name={session.name}>
      <PageHeader
        title="Job management"
        description="Post new jobs and manage applications from sitters."
      />

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Post a new job</h2>
        <NewJobForm pets={pets} />
      </Card>

      <div className="space-y-4">
        {jobs.length === 0 && <p className="text-sm text-stone-400">No jobs posted yet.</p>}
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex flex-col gap-4">

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    Pet: {job.pet.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">{job.description}</p>
                  <p className="mt-1 text-sm font-medium">฿{job.paymentAmount.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <JobStatusBadge status={job.status} />
                  {job.rating !== null && <StarDisplay rating={job.rating} />}
                </div>
              </div>

              {/* Job-level actions */}
              <div className="flex flex-wrap items-center gap-2">
                {job.status === "WAITING" && (
                  <form action={confirmPaymentAction}>
                    <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                    <Button type="submit" style={{ backgroundColor: "var(--info)" }}>Confirm payment</Button>
                  </form>
                )}
                {job.status === "OPEN" && (
                  <form action={cancelJobAction}>
                    <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                    <Button type="submit" style={{ backgroundColor: "var(--danger)" }}>Cancel job</Button>
                  </form>
                )}
                {(job.status === "WAITING" || job.status === "FUNDED" || job.status === "IN_PROGRESS") && (
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No refunds after payment has been initiated.</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Applicants */}
                <div>
                  <h4 className="mb-2 font-medium">Applicants ({job.applications.length})</h4>
                  <div className="space-y-3">
                    {job.applications.length === 0 && (
                      <p className="text-sm text-stone-400">No applications yet.</p>
                    )}
                    {job.applications.map((application) => {
                      const stats = statsMap.get(application.sitter.id);
                      return (
                        <div key={application.id} className="rounded-xl border border-stone-200 p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{application.sitter.name}</p>
                            <div className="flex items-center gap-2">
                              <ApplicationStatusBadge status={application.status} />
                              <SitterProfileModal
                                sitterName={application.sitter.name}
                                profile={application.sitter.sitterProfile ?? null}
                                avgRating={stats?.avgRating ?? null}
                                completedJobs={stats?.completedJobs ?? 0}
                              />
                            </div>
                          </div>
                          <p className="mt-1 text-stone-500">{application.message || "No message"}</p>
                          {job.status === "OPEN" && application.status === "PENDING" && (
                            <form action={selectSitterAction} className="mt-2">
                              <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                              <input suppressHydrationWarning type="hidden" name="sitterId" value={application.sitter.id} />
                              <Button type="submit" className="text-xs px-3 py-1.5">Accept sitter</Button>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Work proofs + completion */}
                <div>
                  <h4 className="mb-2 font-medium">Work proofs</h4>
                  <div className="space-y-3">
                    {job.workProofs.length === 0 && (
                      <p className="text-sm text-stone-400">No proof submitted yet.</p>
                    )}
                    {job.workProofs.map((proof) => (
                      <div key={proof.id} className="rounded-xl border border-stone-200 p-3 text-sm">
                        <p className="text-stone-700">{proof.proofText || "No description"}</p>
                        {proof.imageUrl && (
                          <a href={proof.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-stone-900 underline">
                            Open evidence
                          </a>
                        )}
                        <p className="mt-1 text-xs text-stone-400">Submitted {formatDate(proof.submittedAt)}</p>
                      </div>
                    ))}
                    {job.workProofs.length > 0 && job.status === "IN_PROGRESS" && (
                      <form action={confirmCompletionAction}>
                        <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                        <Button type="submit">Confirm completion</Button>
                      </form>
                    )}
                    {job.status === "COMPLETED" && job.rating === null && (
                      <RateJobForm jobPostId={job.id} />
                    )}
                    {job.status === "COMPLETED" && job.rating !== null && (
                      <p className="text-sm text-stone-500">You rated this job <StarDisplay rating={job.rating} /></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
