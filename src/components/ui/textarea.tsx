import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900", props.className)} {...props} />;
}
