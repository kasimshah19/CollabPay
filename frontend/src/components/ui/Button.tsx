import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    
    let baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-ring cursor-pointer";
    if (disabled || loading) {
      baseStyles += " opacity-60 cursor-not-allowed";
    }

    const variants = {
      primary: "bg-primary text-primary-ink hover:bg-primary/90",
      secondary: "bg-transparent text-ink border border-line hover:bg-soft",
      gold: "bg-gold text-gold-ink hover:bg-gold/90",
      danger: "bg-transparent text-bad border border-line hover:bg-bad hover:text-white" // "secondary style with --bad text" per prompt
    };

    const sizes = {
      sm: "h-9 px-3 text-sm rounded-sm", // small buttons 10px radius (mapped to rounded-sm in standard if we define it, wait, we defined radius-sm: 10px)
      md: "h-11 px-5 text-base rounded-md" // normal buttons 12px
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
