"use client";

import { Button } from "@/components/ui/button";
import { StarPicker } from "@/components/ui/star-rating";
import { rateJobAction } from "@/lib/actions/owner-actions";

export function RateJobForm({ jobPostId }: { jobPostId: string }) {
  return (
    <form action={rateJobAction} className="space-y-3 rounded-xl border border-stone-200 p-3">
      <p className="text-sm font-medium text-stone-700">Rate this sitter</p>
      <input suppressHydrationWarning type="hidden" name="jobPostId" value={jobPostId} />
      <StarPicker name="rating" />
      <Button type="submit" className="text-xs px-3 py-1.5">Submit rating</Button>
    </form>
  );
}
