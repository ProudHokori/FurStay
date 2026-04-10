import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VerificationStatusBadge } from "@/components/ui/badge";
import { saveSitterProfileAction, submitVerificationAction } from "@/lib/actions/sitter-actions";
import { sitterRepository } from "@/lib/repositories/sitter-repository";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

async function saveProfileAction(formData: FormData) {
  "use server";
  await saveSitterProfileAction(null, formData);
}

async function verifyAction(formData: FormData) {
  "use server";
  await submitVerificationAction(null, formData);
}

export default async function SitterProfilePage() {
  const session = await requireRole(["SITTER"]);
  const [profile, requests] = await Promise.all([
    sitterRepository.getProfile(session.sub),
    prisma.verificationRequest.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" } }),
  ]);

  const canResubmit = !profile || profile.verificationStatus === "REJECTED" || profile.verificationStatus === "PENDING";
  const hasPendingRequest = requests.some((r) => r.status === "PENDING");

  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">My profile</h1>

      {/* Profile details */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile details</h2>
        <form action={saveProfileAction} className="space-y-3">
          <Textarea name="bio" placeholder="Short bio" defaultValue={profile?.bio ?? ""} />
          <Textarea name="experience" placeholder="Relevant experience" defaultValue={profile?.experience ?? ""} />
          <Input name="resumeUrl" placeholder="Resume URL (portfolio / LinkedIn / Google Drive)" defaultValue={profile?.resumeUrl ?? ""} />
          <Button type="submit">Save profile</Button>
        </form>
      </Card>

      {/* Verification */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Verification</h2>
          {profile?.verificationStatus && <VerificationStatusBadge status={profile.verificationStatus} />}
        </div>

        {profile?.verificationStatus === "APPROVED" ? (
          <p className="text-sm text-stone-600">Your profile is verified. You can apply to jobs on the job board.</p>
        ) : (
          <>
            {hasPendingRequest && (
              <p className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                Your resume is under review. We&apos;ll notify you once the admin has made a decision.
              </p>
            )}
            {!hasPendingRequest && canResubmit && (
              <form action={verifyAction} className="space-y-3">
                <Input name="resumeUrl" placeholder="Resume / portfolio URL" required />
                <Textarea name="note" placeholder="Add context for the reviewer (optional)" />
                <Button type="submit">Submit for verification</Button>
              </form>
            )}
          </>
        )}
      </Card>
    </AppShell>
  );
}
