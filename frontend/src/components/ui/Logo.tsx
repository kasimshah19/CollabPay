import React from "react";

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-6 h-6 bg-primary rounded-md">
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold rounded-full border-2 border-surface" />
      </div>
      <span className="font-heading text-lg font-bold tracking-[-0.02em] text-ink">
        CollabPay
      </span>
    </div>
  );
};
