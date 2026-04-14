import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { reviewVerificationAction } from "@/lib/actions/admin-actions";
import { adminRepository } from "@/lib/repositories/admin-repository";
import { requireRole } from "@/lib/session";

export default async function AdminVerificationsPage() {
  const session = await requireRole(["ADMIN"]);
  const requests = await adminRepository.getPendingVerifications();
  return (
    <AppShell role="ADMIN" name={session.name}>
      <PageHeader
        title="Verification review"
        description="Review sitter verification requests and approve or reject their profiles."
      />
      {requests.length === 0 && (
        <Card><p className="text-sm text-stone-500">No pending verification requests.</p></Card>
      )}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{request.user.name}</h3>
                <p className="text-sm text-stone-500">{request.user.email}</p>
                {request.note && <p className="mt-3 text-sm text-stone-600">{request.note}</p>}
                {request.documentUrl && (
                  <a href={request.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-stone-900 underline">
                    Open resume / portfolio
                  </a>
                )}
                <p className="mt-2 text-xs text-stone-400">Submitted {new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <form action={reviewVerificationAction}>
                  <input suppressHydrationWarning type="hidden" name="requestId" value={request.id} />
                  <input suppressHydrationWarning type="hidden" name="decision" value="APPROVE" />
                  <Button type="submit">Approve</Button>
                </form>
                <form action={reviewVerificationAction}>
                  <input suppressHydrationWarning type="hidden" name="requestId" value={request.id} />
                  <input suppressHydrationWarning type="hidden" name="decision" value="REJECT" />
                  <Button type="submit" style={{ backgroundColor: "var(--danger)" }}>Reject</Button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
