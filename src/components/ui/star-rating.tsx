"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Display-only star rating
export function StarDisplay({ rating, max = 5 }: { rating: number | null; max?: number }) {
  if (rating === null) return <span className="text-xs text-stone-400">Not rated</span>;
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={cn("h-4 w-4", i < rating ? "text-amber-400" : "text-stone-200")} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// Interactive star picker (used inside a form)
export function StarPicker({ name, defaultValue }: { name: string; defaultValue?: number }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(defaultValue ?? 0);
  return (
    <div className="flex gap-1">
      <input type="hidden" name={name} value={selected} />
      {Array.from({ length: 5 }, (_, i) => {
        const val = i + 1;
        return (
          <button
            key={val}
            type="button"
            onMouseEnter={() => setHovered(val)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(val)}
            aria-label={`Rate ${val} star${val > 1 ? "s" : ""}`}
          >
            <svg
              className={cn("h-7 w-7 transition-colors", (hovered || selected) >= val ? "text-amber-400" : "text-stone-300")}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      {selected > 0 && <span className="ml-2 self-center text-sm text-stone-500">{selected}/5</span>}
    </div>
  );
}
