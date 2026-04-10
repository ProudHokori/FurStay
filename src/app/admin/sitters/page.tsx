import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerificationStatusBadge } from "@/components/ui/badge";
import { banSitterAction, unbanSitterAction } from "@/lib/actions/admin-actions";
import { adminRepository } from "@/lib/repositories/admin-repository";
import { requireRole } from "@/lib/session";

export default async function AdminSittersPage() {
  const session = await requireRole(["ADMIN"]);
  const sitters = await adminRepository.getAllSitters();
  return (
    <AppShell role="ADMIN" name={session.name}>
      <h1 className="text-3xl font-bold">Sitter management</h1>
      <div className="space-y-4">
        {sitters.length === 0 && (
          <Card><p className="text-sm text-stone-500">No sitters registered yet.</p></Card>
        )}
        {sitters.map((sitter) => (
          <Card key={sitter.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{sitter.name}</h3>
                  {sitter.sitterProfile?.verificationStatus && (
                    <VerificationStatusBadge status={sitter.sitterProfile.verificationStatus} />
                  )}
                  {sitter.sitterProfile?.isBanned && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">BANNED</span>
                  )}
                </div>
                <p className="text-sm text-stone-500">{sitter.email}</p>
                {sitter.sitterProfile?.bio && (
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">{sitter.sitterProfile.bio}</p>
                )}
                {sitter.sitterProfile?.resumeUrl && (
                  <a href={sitter.sitterProfile.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-stone-900 underline">
                    View resume
                  </a>
                )}
              </div>
              <div className="shrink-0">
                {sitter.sitterProfile?.isBanned ? (
                  <form action={unbanSitterAction}>
                    <input suppressHydrationWarning type="hidden" name="userId" value={sitter.id} />
                    <Button type="submit" className="bg-stone-600 hover:bg-stone-500">Unban</Button>
                  </form>
                ) : (
                  <form action={banSitterAction}>
                    <input suppressHydrationWarning type="hidden" name="userId" value={sitter.id} />
                    <Button type="submit" className="bg-red-700 hover:bg-red-600">Ban</Button>
                  </form>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
