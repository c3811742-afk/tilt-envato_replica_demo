import { seller, vatRate, type Text } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { Invoice, InvoiceLine } from '@/shared/types';
import { fillText } from './fillText';
import { formatDate, formatNumber, formatPercent, formatPrice } from './format';

// What an invoice line is for, in the active language: "Ultimate plan, Yearly", "Promo code SYNC20"…
export const invoiceLineLabel = (line: InvoiceLine, text: Text, locale: Locale) => {
  const lines = text.invoice.lines;
  const planName = (id: keyof Text['pricing']['plans']) => text.pricing.plans[id].name;
  switch (line.kind) {
    case 'plan':
      return fillText(lines.plan, { plan: planName(line.planId), duration: text.pricing.durations[`month${line.duration}`] });
    case 'seats':
      return fillText(lines.seats, { plan: planName(line.planId), count: formatNumber(line.members, locale) });
    case 'proration':
      return fillText(lines.proration, { from: planName(line.fromPlanId), to: planName(line.toPlanId) });
    case 'pass':
      return fillText(lines.pass, { pass: text.pricing.passes[line.passId].name });
    case 'discount':
      return fillText(lines.discount, { code: line.code });
    case 'balance':
      return lines.balance;
  }
};

// The buyer's name as printed: with the Arabic name too when the user gave one.
export const invoiceBuyer = (invoice: Invoice) => (invoice.buyerArabicName ? `${invoice.buyerName} / ${invoice.buyerArabicName}` : invoice.buyerName);

// The invoice's address line, or an empty string when there is none.
export const invoiceAddress = (invoice: Invoice, text: Text) =>
  invoice.billingAddress ? [invoice.billingAddress.street, invoice.billingAddress.city, text.governorates[invoice.billingAddress.governorate]].join(', ') : '';

// A plain-text e-invoice in the active language (what "Download" saves).
export const buildInvoiceText = (invoice: Invoice, text: Text, locale: Locale) => {
  const labels = text.invoice;
  const address = invoiceAddress(invoice, text);
  return [
    `${labels.heading} (${labels.eInvoice})`,
    '',
    `${labels.number}: ${invoice.number}`,
    `${labels.date}: ${formatDate(invoice.issuedAt, locale)}`,
    `${labels.taxUuid}: ${invoice.taxUuid}`,
    `${labels.seller}: ${text.brand.name}, ${labels.sellerTaxId} ${seller.taxRegistrationNumber}`,
    `${labels.buyer}: ${invoiceBuyer(invoice)}`,
    ...(address ? [`${labels.address}: ${address}`] : []),
    '',
    ...invoice.lines.map((line) => `${invoiceLineLabel(line, text, locale)}: ${formatPrice(line.amount, locale)}`),
    '',
    `${labels.beforeVat}: ${formatPrice(invoice.total - invoice.vat, locale)}`,
    `${fillText(labels.vat, { rate: formatPercent(vatRate, locale) })}: ${formatPrice(invoice.vat, locale)}`,
    `${labels.total}: ${formatPrice(invoice.total, locale)}`,
    `${labels.paidWith}: ${text.pricing.paymentMethods[invoice.paymentMethod]}`,
    `${labels.status}: ${text.billingPage.invoiceStatuses[invoice.status]}`,
    '',
    labels.note,
  ].join('\n');
};
