import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-5 shadow-sm transition-all duration-200 ${
        hoverable ? "hover:border-primary/50 hover:shadow-md hover:translate-y-[-2px]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <h3
      className={`text-display-md text-text font-bold ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <p className={`text-body-sm text-muted ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`text-body-sm text-text ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-border ${className}`} {...props}>
      {children}
    </div>
  );
};
