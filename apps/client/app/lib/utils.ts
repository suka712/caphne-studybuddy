import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared styling for the settings-page field family (label + rounded pill
// box) - used by EditableField, FieldSelect and FieldDatePicker so the
// immediate-save fields look like they belong to the same family as the
// edit-toggle ones.
export const fieldLabelClass =
  "text-[11px] font-black uppercase tracking-widest text-muted-foreground/70";
export const fieldBoxClass =
  "rounded-2xl border-primary/10 bg-secondary/20 font-bold text-sm";

// Shared chip/pill styling for selectable tags (goals, vibes, interests) -
// selected chips must look identical in view and edit mode, wherever they render.
export const chipSelectedClass = "bg-accent/10 border-accent/20 text-primary font-bold";
export const chipUnselectedClass =
  "bg-secondary/20 border-transparent text-muted-foreground hover:bg-secondary/40";
export const chipViewClass = cn(chipSelectedClass, "px-3 py-1.5 text-sm rounded-full");

export function chipClass(active: boolean) {
  return cn(
    "border transition-all duration-200",
    active ? chipSelectedClass : chipUnselectedClass,
  );
}