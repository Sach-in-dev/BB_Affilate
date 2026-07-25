import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "success" | "muted" | "destructive";

const variants: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-green-500/15 text-green-600 dark:text-green-400",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/15 text-destructive",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
