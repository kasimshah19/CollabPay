"use client";

import React from "react";

export interface SegmentedControlProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, ariaLabel }) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || "Options"}
      className="inline-flex bg-soft p-1 rounded-pill"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-pill transition-colors focus-ring ${
              isActive
                ? "bg-surface text-ink shadow-[0_1px_6px_rgba(20,17,46,0.12)]" // soft shadow
                : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
