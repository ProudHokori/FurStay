import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitWorkProofAction } from "@/lib/actions/sitter-actions";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function SitterAssignmentsPage() {
  const session = await requireRole(["SITTER"]);
  const jobs = await prisma.jobPost.findMany({ where: { selectedSitterId: session.sub }, include: { pet: true, workProofs: true }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">Assignments</h1>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{job.pet.name} · {formatDate(job.startDate)} → {formatDate(job.endDate)}</p>
            <p className="mt-3 text-sm text-stone-600">Status: {job.status}</p>
            <form action={submitWorkProofAction} className="mt-4 space-y-3">
              <input type="hidden" name="jobPostId" value={job.id} />
              <Textarea name="proofText" placeholder="Describe what you completed" />
              <Input name="imageUrl" placeholder="Evidence image URL" />
              <Button type="submit">Submit proof</Button>
            </form>
            <div className="mt-4 space-y-2 text-sm text-stone-600">
              {job.workProofs.map((proof) => (
                <p key={proof.id}>Proof submitted at {formatDate(proof.submittedAt)}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
