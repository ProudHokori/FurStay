import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewJobForm } from "./new-job-form";
import {
  confirmCompletionAction,
  confirmPaymentAction,
  cancelJobAction,
  selectSitterAction,
} from "@/lib/actions/owner-actions";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const STATUS_BADGE: Record<string, string> = {
  OPEN:        "bg-emerald-100 text-emerald-800",
  WAITING:     "bg-yellow-100 text-yellow-800",
  FUNDED:      "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  COMPLETED:   "bg-stone-100 text-stone-700",
  CANCELLED:   "bg-red-100 text-red-700",
  REMOVED:     "bg-stone-200 text-stone-500",
};

export default async function OwnerJobsPage() {
  const session = await requireRole(["OWNER"]);
  const [pets, jobs] = await Promise.all([
    prisma.pet.findMany({ where: { ownerId: session.sub }, orderBy: { createdAt: "desc" } }),
    prisma.jobPost.findMany({
      where: { ownerId: session.sub },
      include: {
        pet: true,
        applications: { include: { sitter: true }, orderBy: { createdAt: "desc" } },
        workProofs: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AppShell role="OWNER" name={session.name}>
      <h1 className="text-3xl font-bold">Job management</h1>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Post a new job</h2>
        <NewJobForm pets={pets} />
      </Card>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[job.status] ?? "bg-stone-100"}`}>
                    {job.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  Pet: {job.pet.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}
                </p>
                <p className="mt-3 text-sm text-stone-600">{job.description}</p>
              </div>

              {/* Job-level actions */}
              <div className="flex flex-wrap gap-2">
                {/* Confirm Payment — only when WAITING */}
                {job.status === "WAITING" && (
                  <form action={confirmPaymentAction}>
                    <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                    <Button type="submit" className="bg-blue-700 hover:bg-blue-600">
                      Confirm payment
                    </Button>
                  </form>
                )}

                {/* Cancel — only when OPEN */}
                {job.status === "OPEN" && (
                  <form action={cancelJobAction}>
                    <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                    <Button type="submit" className="bg-red-700 hover:bg-red-600">
                      Cancel job
                    </Button>
                  </form>
                )}

                {/* No-refund notice when past OPEN */}
                {(job.status === "WAITING" || job.status === "FUNDED" || job.status === "IN_PROGRESS") && (
                  <p className="self-center text-xs text-stone-400">No refunds after payment has been initiated.</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Applicants */}
                <div>
                  <h4 className="mb-2 font-medium">Applicants</h4>
                  <div className="space-y-3">
                    {job.applications.length === 0 ? (
                      <p className="text-sm text-stone-500">No applications yet.</p>
                    ) : null}
                    {job.applications.map((application) => (
                      <div key={application.id} className="rounded-xl border border-stone-200 p-3 text-sm">
                        <p className="font-medium">{application.sitter.name}</p>
                        <p className="text-stone-500">{application.message || "No message"}</p>
                        <p className="mt-1 text-xs text-stone-400">Status: {application.status}</p>
                        {job.status === "OPEN" && (
                          <form action={selectSitterAction} className="mt-2">
                            <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                            <input suppressHydrationWarning type="hidden" name="sitterId" value={application.sitter.id} />
                            <Button type="submit">Accept sitter</Button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work proofs */}
                <div>
                  <h4 className="mb-2 font-medium">Work proofs</h4>
                  <div className="space-y-3">
                    {job.workProofs.length === 0 ? (
                      <p className="text-sm text-stone-500">No proof submitted yet.</p>
                    ) : null}
                    {job.workProofs.map((proof) => (
                      <div key={proof.id} className="rounded-xl border border-stone-200 p-3 text-sm">
                        <p>{proof.proofText || "No text provided"}</p>
                        {proof.imageUrl ? (
                          <a href={proof.imageUrl} className="mt-2 block text-stone-900 underline">
                            Open evidence link
                          </a>
                        ) : null}
                      </div>
                    ))}
                    {job.workProofs.length > 0 && job.status !== "COMPLETED" ? (
                      <form action={confirmCompletionAction}>
                        <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                        <Button type="submit">Confirm completion</Button>
                      </form>
                    ) : null}
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
