import React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-ink mb-1 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = "Label";
