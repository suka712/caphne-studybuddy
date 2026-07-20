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

export const chipSelectedClass = "bg-accent/15 border-accent/30 text-primary font-bold";
export const chipUnselectedClass =
  "bg-secondary/50 border-primary/10 text-muted-foreground hover:bg-secondary/70";
export const chipViewClass = cn(chipSelectedClass, "px-3 py-1.5 text-sm rounded-full");

export function chipClass(active: boolean) {
  return cn(
    "border transition-all duration-200",
    active ? chipSelectedClass : chipUnselectedClass,
  );
}