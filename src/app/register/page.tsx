import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { redirectToRoleHome } from "@/lib/route-helpers";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirectToRoleHome(session.role);
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-16">
      <Card className="w-full space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Create an account</h1>
          <p className="mt-2 text-sm text-stone-500">Owners can manage pets and jobs. Sitters can build profiles and apply for work.</p>
        </div>
        <RegisterForm />
        <p className="text-sm text-stone-500">Already registered? <Link href="/login" className="underline text-stone-900">Login</Link></p>
      </Card>
    </main>
  );
}
