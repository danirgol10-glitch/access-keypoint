import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex min-h-11 w-14 shrink-0 cursor-pointer items-center rounded-full border border-[var(--surface-input-border)] bg-[var(--surface-input)] p-1 transition-[background-color,border-color,box-shadow] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] data-[state=checked]:border-[var(--trade-green-border)] data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-6 rounded-full bg-white shadow-control ring-0 transition-transform [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
