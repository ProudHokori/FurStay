import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900", props.className)} {...props} />;
}
