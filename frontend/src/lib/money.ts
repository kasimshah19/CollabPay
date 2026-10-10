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
