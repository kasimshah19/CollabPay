import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  reserved?: number; // 0 to 100
  ariaLabel: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, reserved = 0, ariaLabel }) => {
  const safeValue = Math.min(Math.max(value, 0), 100);
  const safeReserved = Math.min(Math.max(reserved, 0), 100 - safeValue);

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full h-2 bg-soft rounded-pill overflow-hidden flex"
    >
      <div 
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${safeValue}%` }}
      />
      {safeReserved > 0 && (
        <div 
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${safeReserved}%` }}
        />
      )}
    </div>
  );
};
