/** Normalize Thai mobile: strip non-digits, ensure 10 digits starting with 0 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits;
  // Handle +66 prefix
  if (digits.length === 11 && digits.startsWith("66")) return "0" + digits.slice(2);
  return null;
}

export function validatePhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

export function validateReason(reason: string): boolean {
  return reason.trim().length >= 10 && reason.trim().length <= 1000;
}
