export interface StatCardProps {
  label: string; // what the number is, e.g. "Active subscribers"
  value: string; // already formatted, e.g. "1,425" or "EGP 412,300"
  detail?: string; // a muted line under the number, e.g. "Up 4.8% from last month"
  to?: string; // makes the card a link to the page behind the number
  minHeight?: string;
}
