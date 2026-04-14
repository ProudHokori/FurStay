import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";
import { redirectToRoleHome } from "@/lib/route-helpers";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirectToRoleHome(session.role);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center px-10 py-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--fur-dark)" }}
      >
        {/* Background texture circles */}
        <div
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full opacity-10"
          style={{ backgroundColor: "var(--fur-beige)" }}
        />
        <div
          className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full opacity-10"
          style={{ backgroundColor: "var(--fur-clay)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-5"
          style={{ backgroundColor: "var(--fur-cream)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image
            src="/furstay-logo-r.png"
            alt="FurStay"
            width={200}
            height={80}
            className="object-contain mb-8"
          />

          {/* Characters */}
          <div className="flex items-end gap-4 mb-8">
            <div className="relative h-40 w-32">
              <Image
                src="/pet_owner_female.png"
                alt="Pet Owner"
                fill
                className="object-contain object-bottom drop-shadow-lg"
              />
            </div>
            <div className="relative h-40 w-32">
              <Image
                src="/pet_sitter_male.png"
                alt="Pet Sitter"
                fill
                className="object-contain object-bottom drop-shadow-lg"
              />
            </div>
          </div>

          <h2
            className="text-2xl font-bold mb-3 leading-snug"
            style={{ color: "var(--fur-cream)" }}
          >
            Your pets deserve the best care
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--fur-beige)", opacity: 0.8 }}>
            Connect with trusted pet sitters in your area and give your furry friends a home away from home.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {["Verified sitters", "Safe payments", "Real reviews"].map((f) => (
              <span
                key={f}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--fur-beige) 15%, transparent)",
                  color: "var(--fur-beige)",
                  border: "1px solid color-mix(in srgb, var(--fur-beige) 25%, transparent)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Image src="/furstay-logo.png" alt="FurStay" width={140} height={56} className="object-contain" />
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--fur-dark)" }}
            >
              Welcome back
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Sign in to manage your pets and sittings.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-app p-8 shadow-app-md"
            style={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <LoginForm />
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold underline underline-offset-2 transition hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
