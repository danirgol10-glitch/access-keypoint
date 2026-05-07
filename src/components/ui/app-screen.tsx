import * as React from "react";

import { cn } from "@/lib/utils";

type AppScreenMaxWidth = "mobile" | "none";

export interface AppScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  contentClassName?: string;
  scroll?: boolean;
  safe?: boolean;
  maxWidth?: AppScreenMaxWidth;
}

const maxWidthClasses: Record<AppScreenMaxWidth, string> = {
  mobile: "mx-auto w-full max-w-lg",
  none: "w-full",
};

const AppScreen = React.forwardRef<HTMLDivElement, AppScreenProps>(
  (
    {
      children,
      className,
      contentClassName,
      scroll = true,
      safe = true,
      maxWidth = "mobile",
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "app-screen page-bg w-full overflow-x-hidden",
        scroll ? "overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]" : "overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className={cn(maxWidthClasses[maxWidth], safe ? "safe-page" : "px-4 py-4", contentClassName)}>
        {children}
      </div>
    </div>
  ),
);
AppScreen.displayName = "AppScreen";

export { AppScreen };
