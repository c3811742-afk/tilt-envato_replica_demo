const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => emailPattern.test(value.trim());

// A full http(s) link, e.g. https://example.com/item/1
export const isValidLink = (value: string) => {
  const trimmed = value.trim();
  return URL.canParse(trimmed) && /^https?:\/\//i.test(trimmed);
};
