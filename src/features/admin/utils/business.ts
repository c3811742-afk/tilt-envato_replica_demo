import type { Metric, PromoCode, Transaction } from '@/features/admin/types';
import { toDateKey } from './dates';

// The part of a payment that can still be refunded.
export const refundable = (transaction: Pick<Transaction, 'amount' | 'refunded'>) =>
  transaction.amount - transaction.refunded;

export type PromoState = 'active' | 'expired' | 'usedUp' | 'disabled';

// A promo code works while it's on, before its last day and below its use limit.
export const promoState = (promo: PromoCode, day: string = toDateKey()): PromoState => {
  if (!promo.active) return 'disabled';
  if (promo.expiresAt < day) return 'expired';
  if (promo.maxUses !== null && promo.uses >= promo.maxUses) return 'usedUp';
  return 'active';
};

// Change since last month as a share: 0.05 is 5% up, -0.05 is 5% down. 0 when last month was 0.
export const metricChange = ({ value, previous }: Metric) => (previous ? (value - previous) / previous : 0);

// A 9-digit Egyptian tax registration number, as the Tax Authority expects it.
export const isValidTaxId = (value: string) => /^\d{9}$/.test(value.trim());

// One CSV cell. Text with commas, quotes or line breaks is wrapped in quotes so it stays in one cell.
const csvCell = (value: string | number) => {
  const cell = String(value);
  return /[",\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
};

// Builds a CSV file. Starts with a byte order mark so Excel opens Arabic text correctly.
const byteOrderMark = String.fromCharCode(0xfeff);

export const toCsv = (headers: string[], rows: (string | number)[][]) =>
  byteOrderMark + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

// Saves text as a file on the admin's computer (e.g. an exported report).
export const downloadFile = (fileName: string, content: string, type = 'text/csv;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
