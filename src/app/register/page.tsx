import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/session";
import { redirectToRoleHome } from "@/lib/route-helpers";

export default async function RegisterPage() {
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

          {/* Characters — show both owner + sitter to represent both roles */}
          <div className="flex items-end gap-4 mb-8">
            <div className="relative h-44 w-32">
              <Image
                src="/pet_owner_male.png"
                alt="Pet Owner"
                fill
                className="object-contain object-bottom drop-shadow-lg"
              />
            </div>
            <div className="relative h-44 w-32">
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
            Join the FurStay community
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--fur-beige)", opacity: 0.8 }}>
            Whether you&apos;re a loving pet owner or a dedicated sitter, there&apos;s a place for you here.
          </p>

          {/* Role cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
            <div
              className="rounded-[var(--radius-sm)] p-3 text-center"
              style={{
                backgroundColor: "color-mix(in srgb, var(--fur-beige) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--fur-beige) 20%, transparent)",
              }}
            >
              <p className="text-lg mb-1">🐾</p>
              <p className="text-xs font-semibold" style={{ color: "var(--fur-cream)" }}>Pet Owner</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fur-beige)", opacity: 0.7 }}>
                Post jobs & find sitters
              </p>
            </div>
            <div
              className="rounded-[var(--radius-sm)] p-3 text-center"
              style={{
                backgroundColor: "color-mix(in srgb, var(--fur-clay) 20%, transparent)",
                border: "1px solid color-mix(in srgb, var(--fur-clay) 30%, transparent)",
              }}
            >
              <p className="text-lg mb-1">🏠</p>
              <p className="text-xs font-semibold" style={{ color: "var(--fur-cream)" }}>Pet Sitter</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fur-beige)", opacity: 0.7 }}>
                Apply for jobs & earn
              </p>
            </div>
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
              Create your account
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Owners manage pets & jobs. Sitters build profiles and apply for work.
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
            <RegisterForm />
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold underline underline-offset-2 transition hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
