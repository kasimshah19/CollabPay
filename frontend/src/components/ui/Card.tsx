import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", padding = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-line rounded-lg ${padding ? "p-5" : ""} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
