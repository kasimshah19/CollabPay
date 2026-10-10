const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Converts a datetime-local input string (e.g., "2026-10-15T18:30") 
 * assumed to be in IST to a UTC ISO string.
 */
export function istInputToUtcIso(value: string): string {
  if (!value) return "";
  // The input looks like "YYYY-MM-DDTHH:mm"
  // If we append "Z" and parse it, JS treats it as UTC.
  // E.g., "2026-10-15T18:30Z" is 18:30 UTC.
  // But the user entered it as IST. So the actual UTC time is 5.5 hours BEFORE 18:30.
  const parsedAsUtc = new Date(value + "Z");
  if (isNaN(parsedAsUtc.getTime())) return "";

  const actualUtc = new Date(parsedAsUtc.getTime() - IST_OFFSET_MS);
  return actualUtc.toISOString();
}

/**
 * Converts a UTC ISO string back to "YYYY-MM-DDTHH:mm" in IST for datetime-local inputs.
 */
export function utcIsoToIstInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  // Add 5.5 hours to the UTC time so that when we extract UTC components, they reflect IST.
  const istDate = new Date(d.getTime() + IST_OFFSET_MS);
  
  const yyyy = istDate.getUTCFullYear();
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getUTCDate()).padStart(2, '0');
  const hh = String(istDate.getUTCHours()).padStart(2, '0');
  const mins = String(istDate.getUTCMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${mins}`;
}

/**
 * Formats a UTC ISO string to "15 Oct 2026, 6:30 PM IST"
 */
export function formatIst(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  // We can just use Intl.DateTimeFormat with Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Example output: "15 Oct 2026, 6:30 pm"
  // We want to ensure it has " IST" at the end, and standard PM capitalization
  // Replace narrow no-break space (U+202F) or unicode spaces with regular spaces
  let formatted = formatter.format(d).replace(/[\u202F\u00A0]/g, ' ');
  formatted = formatted.replace("am", "AM").replace("pm", "PM");
  return `${formatted} IST`;
}

/**
 * Returns a human-readable string representing time until the deadline.
 */
export function timeUntil(iso: string, now: Date = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return "Closed";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= 1) {
    return `Closes in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours >= 1) {
    return `Closes in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins >= 1) {
    return `Closes in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  }

  return "Closes in <1 min";
}
