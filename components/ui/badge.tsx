import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "accent" | "error" | "muted";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-body-xs font-semibold select-none border";

  const variants = {
    primary:
      "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30",
    accent:
      "bg-accent/10 border-accent/20 text-accent dark:bg-accent/20 dark:border-accent/30",
    error:
      "bg-error/10 border-error/20 text-error dark:bg-error/20 dark:border-error/30",
    muted:
      "bg-surface border-border text-muted",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
