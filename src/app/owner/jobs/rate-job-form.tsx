"use client";

import { Button } from "@/components/ui/button";
import { StarPicker } from "@/components/ui/star-rating";
import { rateJobAction } from "@/lib/actions/owner-actions";

export function RateJobForm({ jobPostId }: { jobPostId: string }) {
  return (
    <form
      action={rateJobAction}
      className="space-y-3 rounded-[var(--radius-sm)] border p-3"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
        Rate this sitter
      </p>
      <input suppressHydrationWarning type="hidden" name="jobPostId" value={jobPostId} />
      <StarPicker name="rating" />
      <Button type="submit" className="text-xs px-3 py-1.5">
        Submit rating
      </Button>
    </form>
  );
}
