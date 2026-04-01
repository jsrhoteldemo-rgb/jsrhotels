const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function normalizeEmail(value: string) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return emailRegex.test(normalizeEmail(value));
}

export function isValidUsPhone(value: string) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

export function isStrongPassword(value: string) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/.test(String(value || ''));
}
