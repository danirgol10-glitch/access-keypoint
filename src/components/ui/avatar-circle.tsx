import * as React from "react";

import { cn } from "@/lib/utils";

type AvatarCircleSize = "sm" | "md" | "lg";

type AvatarCircleBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  initials?: string;
  icon?: React.ReactNode;
  size?: AvatarCircleSize;
};

type AvatarCircleProps =
  | (AvatarCircleBaseProps & {
      src: string;
      alt: string;
    })
  | (AvatarCircleBaseProps & {
      src?: undefined;
      alt?: string;
    });

const sizeClasses: Record<AvatarCircleSize, string> = {
  sm: "size-9 text-xs [&_svg]:size-4",
  md: "size-11 text-sm [&_svg]:size-5",
  lg: "size-14 text-base [&_svg]:size-6",
};

const AvatarCircle = React.forwardRef<HTMLDivElement, AvatarCircleProps>(
  ({ src, alt, initials, icon, size = "md", className, ...props }, ref) => {
    const fallbackLabel = initials || alt || "Avatar";

    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--surface-border)] bg-[linear-gradient(135deg,var(--avatar-gradient-from),var(--avatar-gradient-to))] font-bold uppercase tracking-normal text-[var(--text-primary)] shadow-control",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || fallbackLabel} className="h-full w-full object-cover" />
        ) : initials ? (
          <span aria-label={fallbackLabel}>{initials.slice(0, 2)}</span>
        ) : (
          <span aria-label={fallbackLabel} className="flex items-center justify-center text-[var(--text-secondary)]">
            {icon}
          </span>
        )}
      </div>
    );
  },
);
AvatarCircle.displayName = "AvatarCircle";

export { AvatarCircle };
