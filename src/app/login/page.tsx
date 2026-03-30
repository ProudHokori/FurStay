import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { redirectToRoleHome } from "@/lib/route-helpers";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirectToRoleHome(session.role);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-16">
      <Card className="w-full space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Login to FurStay</h1>
          <p className="mt-2 text-sm text-stone-500">Use a demo account or create your own owner/sitter account.</p>
        </div>
        <LoginForm />
        <p className="text-sm text-stone-500">No account yet? <Link href="/register" className="text-stone-900 underline">Create one</Link></p>
      </Card>
    </main>
  );
}
