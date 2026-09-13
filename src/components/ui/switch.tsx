import type { ComponentProps } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      dir="ltr"
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-elevated shadow-[var(--shadow-border)] transition-colors data-[state=checked]:bg-safe",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-1 rounded-full bg-fg transition-transform data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  );
}
