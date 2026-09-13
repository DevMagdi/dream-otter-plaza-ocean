import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        mute: "bg-elevated text-muted",
        safe: "bg-safe-dim text-safe",
        danger: "bg-danger-dim text-danger",
        warn: "bg-warn-dim text-warn",
        live: "bg-danger-dim text-danger",
      },
    },
    defaultVariants: { tone: "mute" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
