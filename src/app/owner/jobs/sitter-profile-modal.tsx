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
        className="text-xs text-stone-500 underline"
      >
        View profile
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{sitterName}</h3>
                {profile?.verificationStatus && (
                  <div className="mt-1">
                    <VerificationStatusBadge status={profile.verificationStatus} />
                  </div>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700" aria-label="Close">✕</button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <StarDisplay rating={avgRating ? Math.round(avgRating) : null} />
              <span className="text-sm text-stone-500">
                {avgRating ? `${avgRating.toFixed(1)} avg` : "No ratings yet"} · {completedJobs} job{completedJobs !== 1 ? "s" : ""} completed
              </span>
            </div>

            {profile ? (
              <div className="mt-4 space-y-3 text-sm text-stone-600">
                {profile.bio && (
                  <div>
                    <p className="font-medium text-stone-800">About</p>
                    <p className="mt-1">{profile.bio}</p>
                  </div>
                )}
                {profile.experience && (
                  <div>
                    <p className="font-medium text-stone-800">Experience</p>
                    <p className="mt-1">{profile.experience}</p>
                  </div>
                )}
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="block text-stone-900 underline">
                    View resume / portfolio
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-400">This sitter has not set up their profile yet.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
