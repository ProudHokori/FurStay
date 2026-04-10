import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { VerificationBanner } from "@/components/sitter/verification-banner";
import { applyJobAction, withdrawApplicationAction } from "@/lib/actions/sitter-actions";
import { jobRepository } from "@/lib/repositories/job-repository";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { formatDate } from "@/lib/utils";
import { requireRole } from "@/lib/session";

async function applyAction(formData: FormData) {
  "use server";
  await applyJobAction(null, formData);
}

export default async function SitterJobsPage() {
  const session = await requireRole(["SITTER"]);
  const [profile, jobs, myApplications] = await Promise.all([
    sitterRepository.getProfile(session.sub),
    jobRepository.getOpenJobs(),
    jobRepository.getApplicationsBySitter(session.sub),
  ]);

  const isApproved = profile?.verificationStatus === "APPROVED" && !profile.isBanned;

  // Build a map of jobPostId → application for fast lookup
  const appByJobId = new Map(myApplications.map((a) => [a.jobPost.id, a]));

  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">Job board</h1>
      <VerificationBanner verificationStatus={profile?.verificationStatus ?? null} />
      <div className="space-y-4">
        {jobs.length === 0 && (
          <Card><p className="text-sm text-stone-500">No open jobs at the moment. Check back soon.</p></Card>
        )}
        {jobs.map((job) => {
          const myApp = appByJobId.get(job.id);
          return (
            <Card key={job.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {job.owner.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">{job.description}</p>
                  <p className="mt-2 text-sm font-medium text-stone-800">฿{job.paymentAmount.toLocaleString()}</p>

                  {/* Pet profile — critical for sitter to know before applying */}
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                    <p className="mb-1.5 font-semibold text-amber-900">Pet profile</p>
                    <p className="font-medium text-stone-800">
                      {job.pet.name}
                      <span className="ml-1.5 font-normal text-stone-500">
                        {job.pet.type}{job.pet.breed ? ` · ${job.pet.breed}` : ""}{job.pet.age ? ` · ${job.pet.age} yr` : ""}
                      </span>
                    </p>
                    {job.pet.description ? (
                      <p className="mt-1.5 text-stone-700 whitespace-pre-line">{job.pet.description}</p>
                    ) : (
                      <p className="mt-1 text-stone-400 italic">No care notes provided.</p>
                    )}
                  </div>
                </div>
                <div className="min-w-64">
                  {myApp?.status === "PENDING" ? (
                    <div className="space-y-2 rounded-xl border border-stone-200 p-3 text-sm">
                      <p className="text-stone-600">Application submitted</p>
                      <p className="text-xs text-stone-400">{myApp.message || "No message"}</p>
                      <form action={withdrawApplicationAction}>
                        <input suppressHydrationWarning type="hidden" name="applicationId" value={myApp.id} />
                        <button type="submit" className="text-xs text-red-600 underline">Withdraw application</button>
                      </form>
                    </div>
                  ) : myApp?.status === "WITHDRAWN" ? (
                    <div className="space-y-2">
                      <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-500">Application withdrawn</p>
                      {isApproved && (
                        <form action={applyAction} className="space-y-2">
                          <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                          <Textarea name="message" placeholder="New application message" />
                          <Button type="submit">Re-apply</Button>
                        </form>
                      )}
                    </div>
                  ) : myApp?.status === "REJECTED" ? (
                    <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">Application not selected</p>
                  ) : myApp?.status === "ACCEPTED" ? (
                    <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800 font-medium">Accepted — check Assignments</p>
                  ) : isApproved ? (
                    <form action={applyAction} className="space-y-3">
                      <input suppressHydrationWarning type="hidden" name="jobPostId" value={job.id} />
                      <Textarea name="message" placeholder="Short application message" />
                      <Button type="submit">Apply</Button>
                    </form>
                  ) : (
                    <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-500">Verification required to apply</p>
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
