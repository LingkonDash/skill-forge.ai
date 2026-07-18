import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", label, error, helperText, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm font-medium text-text select-none cursor-pointer"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          disabled={disabled}
          className={`w-full px-3 py-2 bg-surface text-text border ${
            error ? "border-error focus-visible:outline-error" : "border-border focus-visible:outline-primary"
          } rounded-md text-body-sm placeholder:text-muted focus-visible:outline-2 disabled:opacity-50 disabled:bg-surface/50 transition-all ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-body-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-body-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
