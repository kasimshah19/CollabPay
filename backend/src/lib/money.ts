// Constants for financial math (single source of truth)
// BPS means basis points, 10000 = 100%.
export const PLATFORM_FEE_BPS = 1000; // 10%
export const GST_BPS = 1800; // 18%
export const TDS_BPS = 100; // 1%

/**
 * Validates a number with at most 2 decimals, returns an integer in paise.
 * Throws on NaN, negative or too many decimals.
 */
export function rupeesToPaise(rupees: number): number {
  if (typeof rupees !== 'number' || Number.isNaN(rupees) || rupees < 0) {
    throw new Error('Invalid amount: must be a non-negative number');
  }
  
  // Check if it has more than 2 decimal places
  const stringVal = rupees.toString();
  const decimalIndex = stringVal.indexOf('.');
  if (decimalIndex !== -1 && stringVal.substring(decimalIndex + 1).length > 2) {
    throw new Error('Invalid amount: cannot have more than 2 decimal places');
  }

  // Convert to paise safely (Math.round handles JS float inaccuracies like 0.14 * 100 = 14.000000000000002)
  return Math.round(rupees * 100);
}

/**
 * Applies basis points to an amount in paise.
 * Integer math with ROUND HALF UP, avoiding floating point inaccuracies.
 * Adding 5000 (half of 10000) before integer division (Math.floor) achieves round-half-up mathematically.
 */
export function applyBps(amountPaise: number, bps: number): number {
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 0) {
    throw new Error('Invalid amount: must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(bps) || bps < 0) {
    throw new Error('Invalid bps: must be a non-negative safe integer');
  }
  
  return Math.floor((amountPaise * bps + 5000) / 10000);
}

export interface PayoutDetails {
  feePaise: number;
  platformFeePaise: number;
  gstPaise: number;
  tdsPaise: number;
  creatorNetPaise: number;
  brandTotalPaise: number;
}

/**
 * Calculates payout details based on the agreed fee.
 * 
 * Assumption:
 * - Platform fee and GST are billed to the brand on top of the creator fee.
 * - TDS is deducted from the creator fee.
 */
export function calculatePayout(feePaise: number): PayoutDetails {
  if (!Number.isSafeInteger(feePaise) || feePaise < 0) {
    throw new Error('Invalid fee: must be a non-negative safe integer');
  }

  const platformFeePaise = applyBps(feePaise, PLATFORM_FEE_BPS);
  const gstPaise = applyBps(platformFeePaise, GST_BPS); // GST on platform fee only
  const tdsPaise = applyBps(feePaise, TDS_BPS); // TDS on creator payout
  
  const creatorNetPaise = feePaise - tdsPaise;
  const brandTotalPaise = feePaise + platformFeePaise + gstPaise;

  return {
    feePaise,
    platformFeePaise,
    gstPaise,
    tdsPaise,
    creatorNetPaise,
    brandTotalPaise
  };
}
