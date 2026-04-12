import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirectToRoleHome } from "@/lib/route-helpers";

const features = [
  {
    title: "Post Pet Care Jobs",
    description:
      "Pet owners can create care requests with clear details so sitters understand the job before applying.",
  },
  {
    title: "Verified Sitter Flow",
    description:
      "Pet sitters go through verification before joining the platform, helping build trust and platform safety.",
  },
  {
    title: "Role-Based Experience",
    description:
      "Each type of user sees a focused flow designed for their own responsibilities and tasks.",
  },
];

const roles = [
  {
    title: "Pet Owner",
    description:
      "Create pet profiles, post jobs, review applications, and choose the most suitable sitter.",
  },
  {
    title: "Pet Sitter",
    description:
      "Complete verification, browse available jobs, apply for work, and submit proof after care is completed.",
  },
  {
    title: "Admin",
    description:
      "Review verification requests and help moderate the platform to keep the system organized and reliable.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) redirectToRoleHome(session.role);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] pt-[88px] text-[var(--foreground)]">
      <header className="fixed shadow inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,white)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href="/"
            className="relative h-11 w-[170px] transition-transform duration-200 hover:scale-[1.02] sm:h-12 sm:w-[190px]"
          >
            <Image
              src="/furstay-logo.png"
              alt="FurStay logo"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold text-[var(--fur-dark)] transition sm:px-5 sm:text-base"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="btn-primary px-5 py-2 text-sm font-semibold sm:text-base"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-80px] top-10 h-56 w-56 rounded-full bg-[var(--fur-pink)]/20 blur-3xl" />
          <div className="absolute right-[-60px] top-24 h-72 w-72 rounded-full bg-[var(--fur-beige)]/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[var(--secondary)]/35 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-20">
          <section className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--primary)] shadow-[var(--shadow-sm)]">
              <span className="text-base">🐾</span>
              Trusted care for your furry family
            </div>

            <div className="relative mx-auto mb-6 h-20 w-[280px] sm:h-24 sm:w-[360px] lg:mx-0 lg:h-24 lg:w-[420px]">
              <Image
                src="/furstay-logo.png"
                alt="FurStay"
                fill
                priority
                className="object-contain lg:object-left"
              />
            </div>

            <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-[-0.02em] text-[var(--fur-dark)] sm:text-4xl lg:mx-0 lg:text-5xl">
              A warm and reliable pet-sitting platform for modern families
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg lg:mx-0">
              FurStay helps pet owners connect with trusted sitters through a
              clean, friendly, and role-focused experience designed to make pet
              care feel simple, safe, and comforting.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link
                href="/login"
                className="btn-secondary min-w-[220px] rounded-full px-8 py-4 text-base font-bold shadow-[var(--shadow-sm)] transition hover:-translate-y-[1px]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="btn-primary min-w-[220px] rounded-full px-8 py-4 text-base font-bold shadow-[var(--shadow-sm)] transition hover:-translate-y-[1px]"
              >
                Join Us!
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--muted-foreground)] lg:justify-start">
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">
                Verified sitters
              </span>
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">
                Role-based platform
              </span>
              <span className="rounded-full bg-[var(--surface)] px-4 py-2">
                Friendly experience
              </span>
            </div>
          </section>

          <section className="relative">
            <div className="relative mx-auto max-w-md rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-2),var(--surface))] p-5 shadow-[0_20px_60px_rgba(111,86,73,0.12)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    FurStay Experience
                  </p>
                  <h2 className="text-xl font-bold text-[var(--fur-dark)]">
                    Simple, soft, and trustworthy
                  </h2>
                </div>
                <div className="relative h-12 w-12">
                  <Image
                    src="/furstay-logo-symbol.png"
                    alt="FurStay symbol"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] bg-[var(--background)] p-4 shadow-[var(--shadow-sm)]">
                  <p className="text-sm font-semibold text-[var(--fur-dark)]">
                    For Pet Owners
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Create requests, share pet details, and choose the right
                    sitter with confidence.
                  </p>
                </div>

                <div className="rounded-[24px] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)]">
                  <p className="text-sm font-semibold text-[var(--fur-dark)]">
                    For Pet Sitters
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Discover care opportunities, apply easily, and submit proof
                    after completing each job.
                  </p>
                </div>

                <div className="rounded-[24px] bg-[var(--secondary)]/45 p-4 shadow-[var(--shadow-sm)]">
                  <p className="text-sm font-semibold text-[var(--fur-dark)]">
                    For Admins
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Keep the platform organized through verification review and
                    moderation support.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6 lg:px-10 lg:py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
            <span>✨</span>
            Platform Features
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--fur-dark)] sm:text-3xl">
            Everything feels clear and easy to follow
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
            Designed to keep the pet-sitting journey smooth, warm, and
            approachable for every user.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(111,86,73,0.10)]"
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary)]/60">
                  <span className="text-lg">{["📝", "🛡️", "👥"][index]}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--fur-dark)]">
                  {feature.title}
                </h3>
              </div>

              <p className="text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
            <span>🌷</span>
            Designed for Every Role
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--fur-dark)] sm:text-3xl">
            A focused experience for each responsibility
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
            Each user type gets a flow that matches what they actually need to
            do on the platform.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(111,86,73,0.10)]"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[var(--secondary)]/30" />

              <div className="relative mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-2)] shadow-[var(--shadow-sm)]">
                  <span className="text-lg">{["🐶", "🐱", "⭐"][index]}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--fur-dark)]">
                  {role.title}
                </h3>
              </div>

              <p className="relative text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}