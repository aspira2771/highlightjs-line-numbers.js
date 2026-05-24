import { differenceInCalendarDays, format, isSameDay, parseISO } from 'date-fns';

export function toISODateTime(date: Date = new Date()): string {
  return date.toISOString();
}

export function toISODate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDate(value: string): Date {
  return parseISO(value);
}

export function isToday(value: string): boolean {
  return isSameDay(parseISO(value), new Date());
}

export function formatKoreanDate(value: string): string {
  return format(parseISO(value), 'yyyy년 M월 d일');
}

export function formatKoreanTime(value: string): string {
  return format(parseISO(value), 'a h:mm')
    .replace('AM', '오전')
    .replace('PM', '오후');
}

export function daysSince(value: string): number {
  return differenceInCalendarDays(new Date(), parseISO(value));
}

export function ageInYears(birthDate?: string): number | null {
  if (!birthDate) return null;
  const days = differenceInCalendarDays(new Date(), parseISO(birthDate));
  return Math.floor(days / 365);
}
