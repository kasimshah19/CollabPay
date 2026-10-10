import React from "react";
import { formatPaise } from "../../lib/money";

export interface MoneyProps {
  paise: number;
  tone?: "default" | "credit" | "debit" | "gold";
}

export const Money: React.FC<MoneyProps> = ({ paise, tone = "default" }) => {
  const formatted = formatPaise(Math.abs(paise));
  
  let displayValue = formatted;
  if (tone === "credit") {
    displayValue = `+${formatted}`;
  } else if (tone === "debit" || paise < 0) {
    displayValue = `-${formatted}`;
  }

  const toneClasses = {
    default: "text-ink",
    credit: "text-ok",
    debit: "text-bad",
    gold: "text-gold"
  };

  return (
    <span className={`tabular-money ${toneClasses[tone]}`}>
      {displayValue}
    </span>
  );
};
