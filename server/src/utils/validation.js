const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(normalizeEmail(value));
}

export function normalizePhone(value) {
  return String(value || '').trim();
}

export function isValidUsPhone(value) {
  const digits = normalizePhone(value).replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

export function isStrongPassword(value) {
  const password = String(value || '');
  return /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/.test(password);
}
