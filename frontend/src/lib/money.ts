export const PLATFORM_FEE_BPS = 1000; // 10%
export const GST_BPS = 1800; // 18%
export const TDS_BPS = 100; // 1%

export function applyBps(amountPaise: number, bps: number): number {
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 0) {
    throw new Error("Invalid amount");
  }
  if (!Number.isSafeInteger(bps) || bps < 0) {
    throw new Error("Invalid bps");
  }
  return Math.floor((amountPaise * bps + 5000) / 10000);
}

export function formatPaise(paise: number): string {
  // Convert paise to rupees (float)
  const rupees = paise / 100;
  
  // Format using Indian locale
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function parseRupeesToPaise(input: string): { ok: true, paise: number } | { ok: false, error: string } {
  const cleanInput = input.trim().replace(/,/g, "");
  if (!cleanInput) {
    return { ok: false, error: "Amount cannot be empty" };
  }
  if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(cleanInput) && !/^\.[0-9]{1,2}$/.test(cleanInput)) {
    return { ok: false, error: "Invalid amount format" };
  }
  
  let [rupeesStr, paiseStr] = cleanInput.split(".");
  rupeesStr = rupeesStr || "0";
  paiseStr = paiseStr || "00";
  if (paiseStr.length === 1) paiseStr += "0";

  const paise = parseInt(rupeesStr, 10) * 100 + parseInt(paiseStr, 10);
  
  if (paise === 0) {
    return { ok: false, error: "Amount must be greater than zero" };
  }
  if (paise > 1000000000) {
    return { ok: false, error: "Amount cannot exceed Rs 10,00,00,000" };
  }

  return { ok: true, paise };
}

export function calculatePayout(feePaise: number) {
  if (!Number.isSafeInteger(feePaise) || feePaise < 0) {
    throw new Error("Invalid fee");
  }

  const platformFeePaise = applyBps(feePaise, PLATFORM_FEE_BPS);
  const gstPaise = applyBps(platformFeePaise, GST_BPS);
  const tdsPaise = applyBps(feePaise, TDS_BPS);
  
  const creatorPayoutPaise = feePaise - tdsPaise;
  const brandCostPaise = feePaise + platformFeePaise + gstPaise;

  return {
    feePaise,
    platformFeePaise,
    gstPaise,
    tdsPaise,
    creatorPayoutPaise,
    brandCostPaise
  };
}
