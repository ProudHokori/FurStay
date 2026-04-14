import Link from "next/link";

type Props = {
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
};

export function VerificationBanner({ verificationStatus }: Props) {
  if (verificationStatus === "APPROVED") return null;

  if (verificationStatus === "REJECTED") {
    return (
      <div
        className="rounded-[var(--radius-sm)] border px-4 py-3 text-sm"
        style={{
          borderColor: "color-mix(in srgb, var(--danger) 40%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--danger) 10%, var(--surface-2))",
          color: "color-mix(in srgb, var(--danger) 70%, #000)",
        }}
      >
        <span className="font-semibold">Verification rejected.</span> Your resume was not approved.{" "}
        <Link href="/sitter/profile" className="underline font-medium">
          Re-submit your resume
        </Link>{" "}
        to regain access to the job board.
      </div>
    );
  }

  // PENDING or no profile yet
  return (
    <div
      className="rounded-[var(--radius-sm)] border px-4 py-3 text-sm"
      style={{
        borderColor: "color-mix(in srgb, var(--warning) 50%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--warning) 15%, var(--surface-2))",
        color: "color-mix(in srgb, var(--warning) 30%, #000)",
      }}
    >
      <span className="font-semibold">Verification required.</span>{" "}
      {verificationStatus === "PENDING"
        ? "Your resume is under review. You'll be able to apply for jobs once approved."
        : (
          <>
            Submit your resume on the{" "}
            <Link href="/sitter/profile" className="underline font-medium">
              Profile page
            </Link>{" "}
            to start accepting jobs.
          </>
        )}
    </div>
  );
}
