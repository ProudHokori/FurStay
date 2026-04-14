import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { VerificationBanner } from "@/components/sitter/verification-banner";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { jobRepository } from "@/lib/repositories/job-repository";
import { requireRole } from "@/lib/session";

export default async function SitterDashboardPage() {
  const session = await requireRole(["SITTER"]);
  const [profile, applications, upcoming, awaitingConfirmation, history] = await Promise.all([
    sitterRepository.getProfile(session.sub),
    jobRepository.getApplicationsBySitter(session.sub),
    jobRepository.getAssignmentsBySitter(session.sub).then((jobs) => jobs.filter((j) => j.status === "FUNDED")),
    jobRepository.getAssignmentsBySitter(session.sub).then((jobs) => jobs.filter((j) => j.status === "IN_PROGRESS")),
    jobRepository.getJobHistoryBySitter(session.sub),
  ]);

  const activeCount = upcoming.length + awaitingConfirmation.length;
  const avgRating = history.filter((j) => j.rating !== null).length > 0
    ? (history.reduce((sum, j) => sum + (j.rating ?? 0), 0) / history.filter((j) => j.rating !== null).length).toFixed(1)
    : null;

  return (
    <AppShell role="SITTER" name={session.name}>
      <PageHeader
        title="Overview"
        description="Your dashboard — a quick look at your verification status, applications, and earnings."
      />
      <VerificationBanner verificationStatus={profile?.verificationStatus ?? null} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-stone-500">Verification</p>
          <p className="mt-2 text-lg font-semibold">{profile?.verificationStatus ?? "Not submitted"}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Applications</p>
          <p className="mt-2 text-3xl font-semibold">{applications.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Active assignments</p>
          <p className="mt-2 text-3xl font-semibold">{activeCount}</p>
          <div className="mt-1 flex gap-3 text-xs text-stone-400">
            <span>Upcoming: {upcoming.length}</span>
            <span>Awaiting: {awaitingConfirmation.length}</span>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Avg rating</p>
          <p className="mt-2 text-3xl font-semibold">{avgRating ?? "—"}</p>
          <p className="mt-1 text-xs text-stone-400">from {history.filter((j) => j.rating !== null).length} job{history.filter((j) => j.rating !== null).length !== 1 ? "s" : ""}</p>
        </Card>
      </div>
    </AppShell>
  );
}
