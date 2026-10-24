// Fills {placeholders} in a UI string: fillText('{count} results', { count: '12' }) -> '12 results'.
// Format numbers and prices first (formatNumber, formatPrice) so they follow the active language.
export const fillText = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
