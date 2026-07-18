import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  ...props
}) => {
  const baseStyles = "animate-pulse bg-border/60 dark:bg-border/40";

  const variants = {
    text: "h-4 w-full rounded",
    rectangular: "w-full rounded-lg",
    circular: "rounded-full",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
