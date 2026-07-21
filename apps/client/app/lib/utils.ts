import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fieldLabelClass =
  "text-[11px] font-black uppercase tracking-widest text-muted-foreground/70";
export const fieldBoxClass =
  "rounded-xl border-primary/10 bg-secondary/50 font-bold text-sm";

// Read-only chip pill (used on /profile).
export const chipViewClass =
  "bg-accent/15 border-accent/30 text-primary font-bold px-3 py-1.5 text-sm rounded-full";