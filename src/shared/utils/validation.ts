import { auth, card, governorates, type Governorate } from '@/shared/constants';

// Why a form field is invalid. Each reason has a message in text.validation.
export type FieldError =
  | 'required'
  | 'invalidEmail'
  | 'passwordTooShort'
  | 'passwordWeak'
  | 'passwordsDontMatch'
  | 'invalidPhone'
  | 'invalidCode'
  | 'invalidCardNumber'
  | 'invalidExpiry'
  | 'invalidCvc'
  | 'invalidInstapay'
  | 'termsRequired'
  | 'chooseAtLeastOne';

type Validator = (value: string) => FieldError | null;

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const validateRequired: Validator = (value) => (value.trim() ? null : 'required');

export const validateEmail: Validator = (value) => {
  if (!value.trim()) return 'required';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'invalidEmail';
};

export const validatePassword: Validator = (value) => {
  if (!value) return 'required';
  if (value.length < auth.passwordMinLength) return 'passwordTooShort';
  return /[A-Za-z]/.test(value) && /\d/.test(value) ? null : 'passwordWeak';
};

export const validatePasswordConfirmation = (password: string, confirmation: string): FieldError | null => {
  if (!confirmation) return 'required';
  return password === confirmation ? null : 'passwordsDontMatch';
};

// Egyptian mobile numbers, with or without the +20 / 0 prefix: 010, 011, 012 or 015 then 8 digits.
export const normalizeEgyptianMobile = (value: string) => {
  const digits = onlyDigits(value);
  const national = digits.startsWith('20') ? digits.slice(2) : digits;
  return national.startsWith('0') ? national : `0${national}`;
};

export const validateEgyptianMobile: Validator = (value) => {
  if (!value.trim()) return 'required';
  return /^01[0125]\d{8}$/.test(normalizeEgyptianMobile(value)) ? null : 'invalidPhone';
};

export const validateCode: Validator = (value) => {
  if (!value.trim()) return 'required';
  return new RegExp(`^\\d{${auth.codeLength}}$`).test(value.trim()) ? null : 'invalidCode';
};

// The Luhn checksum every Visa, Mastercard and Meeza number passes.
const passesLuhn = (digits: string) =>
  [...digits].reverse().reduce((sum, char, index) => {
    const digit = Number(char) * (index % 2 ? 2 : 1);
    return sum + (digit > 9 ? digit - 9 : digit);
  }, 0) %
    10 ===
  0;

export const validateCardNumber: Validator = (value) => {
  const digits = onlyDigits(value);
  if (!digits) return 'required';
  return digits.length === card.numberLength && passesLuhn(digits) ? null : 'invalidCardNumber';
};

// "MM/YY", not in the past.
export const validateExpiry = (value: string, today: Date = new Date()): FieldError | null => {
  const digits = onlyDigits(value);
  if (!digits) return 'required';
  if (digits.length !== 4) return 'invalidExpiry';
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return 'invalidExpiry';
  const endOfMonth = new Date(year, month, 1);
  return endOfMonth > today ? null : 'invalidExpiry';
};

export const validateCvc: Validator = (value) => {
  const digits = onlyDigits(value);
  if (!digits) return 'required';
  return digits.length >= card.cvcLength.min && digits.length <= card.cvcLength.max ? null : 'invalidCvc';
};

// An InstaPay payment address (name@instapay) or the mobile number linked to InstaPay.
export const validateInstapay: Validator = (value) => {
  if (!value.trim()) return 'required';
  if (/^[a-z0-9._-]+@instapay$/i.test(value.trim())) return null;
  return validateEgyptianMobile(value) ? 'invalidInstapay' : null;
};

// "4242424242424242" -> "4242 4242 4242 4242", for card number inputs.
export const formatCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, card.numberLength)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

// "1228" -> "12/28", for expiry inputs.
export const formatExpiry = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const isGovernorate = (value: unknown): value is Governorate =>
  typeof value === 'string' && (governorates as readonly string[]).includes(value);

export const keepDigits = (value: string, maxLength: number) => onlyDigits(value).slice(0, maxLength);
