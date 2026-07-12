import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay, isSameDay, addDays, getYear, getMonth, isSameMonth } from 'date-fns';

export const MANILA_TZ = 'Asia/Manila';

/**
 * Returns a local Date object where its local time fields (getFullYear, etc)
 * represent the current time in Manila.
 */
export function getManilaDate(): Date {
  return toZonedTime(new Date(), MANILA_TZ);
}

/**
 * Converts a UTC/local Date or ISO string into a local Date object
 * representing Manila time.
 */
export function parseManilaDate(date: Date | string | number): Date {
  return toZonedTime(date, MANILA_TZ);
}

/**
 * Formats a Date/string strictly in Manila time.
 * If you pass a `Date` object, it converts to Manila time before formatting.
 */
export function formatDateManila(date: Date | string | number, formatStr: string = 'MM/dd/yyyy'): string {
  return format(new Date(date), formatStr, { timeZone: MANILA_TZ });
}

/**
 * Helper to check if a date string/object is "today" in Manila time.
 */
export function isTodayManila(date: Date | string | number): boolean {
  return isSameDay(getManilaDate(), parseManilaDate(date));
}

/**
 * Helper to check if a date string/object is "tomorrow" in Manila time.
 */
export function isTomorrowManila(date: Date | string | number): boolean {
  return isSameDay(addDays(getManilaDate(), 1), parseManilaDate(date));
}

/**
 * Helper to check if a date string/object is "overdue" in Manila time.
 * Basically if it is before the start of today in Manila.
 */
export function isOverdueManila(date: Date | string | number): boolean {
  const manilaTarget = parseManilaDate(date);
  const manilaTodayStart = startOfDay(getManilaDate());
  return manilaTarget < manilaTodayStart;
}

/**
 * Helper to check if a date string/object belongs to the current month in Manila time.
 */
export function isCurrentMonthManila(date: Date | string | number): boolean {
  return isSameMonth(getManilaDate(), parseManilaDate(date));
}

/**
 * Returns a UTC Date representing the true physical start of the day in Manila.
 */
export function getStartOfDayManila(date: Date | string | number = new Date()): Date {
  const zoned = parseManilaDate(date);
  const start = startOfDay(zoned);
  return fromZonedTime(start, MANILA_TZ);
}

/**
 * Returns a UTC Date representing the true physical end of the day in Manila.
 */
export function getEndOfDayManila(date: Date | string | number = new Date()): Date {
  const zoned = parseManilaDate(date);
  const end = endOfDay(zoned);
  return fromZonedTime(end, MANILA_TZ);
}

/**
 * Extract Manila year
 */
export function getYearManila(date: Date | string | number = new Date()): number {
  return getYear(parseManilaDate(date));
}

/**
 * Extract Manila month (0-11)
 */
export function getMonthManila(date: Date | string | number = new Date()): number {
  return getMonth(parseManilaDate(date));
}
