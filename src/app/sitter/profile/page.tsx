import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveSitterProfileAction, submitVerificationAction } from "@/lib/actions/sitter-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function SitterProfilePage() {
  const session = await requireRole(["SITTER"]);
  const [profile, requests] = await Promise.all([
    prisma.sitterProfile.findUnique({ where: { userId: session.sub } }),
    prisma.verificationRequest.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <AppShell role="SITTER" name={session.name}>
      <h1 className="text-3xl font-bold">Sitter profile</h1>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile details</h2>
        <form action={saveSitterProfileAction} className="space-y-3">
          <Textarea name="bio" placeholder="Short bio" defaultValue={profile?.bio ?? ""} />
          <Textarea name="experience" placeholder="Relevant experience" defaultValue={profile?.experience ?? ""} />
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Verification request</h2>
        <form action={submitVerificationAction} className="space-y-3">
          <Input name="documentUrl" placeholder="Portfolio / certificate / ID link" />
          <Textarea name="note" placeholder="Add context for the admin reviewer" />
          <Button type="submit">Submit request</Button>
        </form>
        <div className="mt-4 space-y-2 text-sm text-stone-600">
          {requests.map((request) => (
            <p key={request.id}>Request {request.id.slice(-6)} · {request.status}</p>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
