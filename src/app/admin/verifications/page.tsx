import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reviewVerificationAction } from "@/lib/actions/admin-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function AdminVerificationsPage() {
  const session = await requireRole(["ADMIN"]);
  const requests = await prisma.verificationRequest.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell role="ADMIN" name={session.name}>
      <h1 className="text-3xl font-bold">Verification review</h1>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{request.user.name}</h3>
                <p className="text-sm text-stone-500">{request.user.email}</p>
                <p className="mt-3 text-sm text-stone-600">{request.note || "No note provided"}</p>
                {request.documentUrl ? <a href={request.documentUrl} className="mt-2 inline-block text-sm underline">Open supporting document</a> : null}
              </div>
              <div className="flex gap-2">
                <form action={reviewVerificationAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="decision" value="APPROVE" />
                  <Button type="submit">Approve</Button>
                </form>
                <form action={reviewVerificationAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="decision" value="REJECT" />
                  <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium">Reject</button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
