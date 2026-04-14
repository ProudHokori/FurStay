"use client";

import { useState } from "react";
import { StarDisplay } from "@/components/ui/star-rating";
import { VerificationStatusBadge } from "@/components/ui/badge";

type SitterProfile = {
  bio: string | null;
  experience: string | null;
  resumeUrl: string | null;
  verificationStatus: string;
} | null;

type Props = {
  sitterName: string;
  profile: SitterProfile;
  avgRating: number | null;
  completedJobs: number;
};

export function SitterProfileModal({ sitterName, profile, avgRating, completedJobs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs underline transition hover:opacity-70"
        style={{ color: "var(--muted-foreground)" }}
      >
        View profile
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-app p-6 shadow-app-md"
            style={{ backgroundColor: "var(--surface-2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: "var(--fur-dark)" }}>
                  {sitterName}
                </h3>
                {profile?.verificationStatus && (
                  <div className="mt-1">
                    <VerificationStatusBadge status={profile.verificationStatus} />
                  </div>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="transition hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <StarDisplay rating={avgRating ? Math.round(avgRating) : null} />
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {avgRating ? `${avgRating.toFixed(1)} avg` : "No ratings yet"} ·{" "}
                {completedJobs} job{completedJobs !== 1 ? "s" : ""} completed
              </span>
            </div>

            {profile ? (
              <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--foreground)" }}>
                {profile.bio && (
                  <div>
                    <p className="font-medium" style={{ color: "var(--fur-dark)" }}>
                      About
                    </p>
                    <p className="mt-1">{profile.bio}</p>
                  </div>
                )}
                {profile.experience && (
                  <div>
                    <p className="font-medium" style={{ color: "var(--fur-dark)" }}>
                      Experience
                    </p>
                    <p className="mt-1">{profile.experience}</p>
                  </div>
                )}
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block underline transition hover:opacity-70"
                    style={{ color: "var(--fur-dark)" }}
                  >
                    View resume / portfolio
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                This sitter has not set up their profile yet.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
