// Time helpers shared by build-time rendering and the browser. Everything is
// computed in Ho Chi Minh City time so results never depend on the visitor's
// (or the build machine's) time zone. Keep this module import-free.

export const HCMC_TZ = 'Asia/Ho_Chi_Minh';

/** Calendar month in `YYYY-MM` form, e.g. `2026-03`. */
export type YearMonth = `${number}-${string}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let partsFormatter: Intl.DateTimeFormat | undefined;

/** Calendar and clock parts of `now` as seen in Ho Chi Minh City. */
export function hcmcParts(now: Date = new Date()) {
  partsFormatter ??= new Intl.DateTimeFormat('en-GB', {
    timeZone: HCMC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(now)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: p.hour,
    minute: p.minute,
  };
}

function parseYearMonth(value: YearMonth): [number, number] {
  const [y, m] = value.split('-').map(Number);
  return [y, m];
}

/** Whole months from `start` to `end` (exclusive), or to the current HCMC month. */
export function monthsBetween(start: YearMonth, end?: YearMonth, now: Date = new Date()): number {
  const [sy, sm] = parseYearMonth(start);
  let ey: number;
  let em: number;
  if (end) {
    [ey, em] = parseYearMonth(end);
  } else {
    const p = hcmcParts(now);
    ey = p.year;
    em = p.month;
  }
  return Math.max(0, (ey - sy) * 12 + (em - sm));
}

/** Tenure label such as "3 yrs 5 mo", "1 yr 7 mo" or "7 mo". */
export function tenureLabel(start: YearMonth, end?: YearMonth, now: Date = new Date()): string {
  const total = monthsBetween(start, end, now);
  if (total === 0) return '< 1 mo';
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} mo`);
  return parts.join(' ');
}

/** "Mar 2026" */
export function formatMonth(value: YearMonth): string {
  const [y, m] = parseYearMonth(value);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Mar 2026 — Present" / "Sep 2022 — Feb 2026" */
export function formatRange(start: YearMonth, end?: YearMonth): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : 'Present'}`;
}
