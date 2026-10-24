const pad = (value: number) => String(value).padStart(2, '0');

// A local calendar day as YYYY-MM-DD, the value format of <input type="date">.
// Days in this format compare correctly as plain strings.
export const toDateKey = (date: Date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// A local date and time as YYYY-MM-DDTHH:mm, the value format of <input type="datetime-local">.
export const toDateTimeKey = (date: Date = new Date()) =>
  `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

// A month as YYYY-MM, the value format of <input type="month">.
export const toMonthKey = (date: Date = new Date()) => toDateKey(date).slice(0, 7);

// Reads YYYY-MM-DD (or YYYY-MM) as a local date. new Date('2026-10-01') would be midnight UTC,
// which is still the day before in some time zones.
export const fromDateKey = (key: string) => {
  const [year, month, day = 1] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const monthsBefore = (months: number, from: Date = new Date()) => {
  const date = new Date(from);
  date.setMonth(date.getMonth() - months);
  return date;
};
