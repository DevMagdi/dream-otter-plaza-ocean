import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className,
      )}
      {...props}
    />
  );
}
