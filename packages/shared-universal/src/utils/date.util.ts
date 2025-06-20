import { formatDistance, formatRelative } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);

export function setDayJsLocale(locale: string) {
  dayjs.locale(locale);
}

export function dateParse(date: string) {
  return dayjs(date, 'DD/MM/YYYY').toDate();
}

export function getDayName(date: string, weekday: 'long' | 'short' = 'short') {
  const day = dateParse(date).getDay();

  return weekday === 'long' ? WEEKDAYS_LONG[day] : WEEKDAYS_SHORT[day];
}

export function getDaysBetweenTwoDates(from?: string, to?: string): number {
  if (!from || !to) return 0;

  const dateFrom = dayjs(from, 'DD/MM/YYYY');
  const dateTo = dayjs(to, 'DD/MM/YYYY');

  return dateFrom.diff(dateTo, 'day') + 1;
}

export function getDayNameNative(date = new Date(), locale = 'en-us') {
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

export function getFormatDistance(date: Date, addSuffix = false, locale = 'en-us') {
  let currentLocale = enUS;

  switch (locale) {
    case 'vi-vn':
      currentLocale = vi;
      break;
    default:
      currentLocale = enUS;
  }

  return formatDistance(date, new Date(), { addSuffix, locale: currentLocale });
}

export function getFormatRelative(date: Date, locale = 'en-us') {
  let currentLocale = enUS;

  switch (locale) {
    case 'vi-vn':
      currentLocale = vi;
      break;
    default:
      currentLocale = enUS;
  }

  return formatRelative(date, new Date(), { locale: currentLocale });
}

export function getFormatByLocale(locale = 'en-us') {
  let formatString;

  switch (locale) {
    case 'vi-vn':
      formatString = 'dd/MM/yyyy';
      break;
    default:
      formatString = 'MM/dd/yyyy';
  }

  return formatString;
}

export function toDateTime(date: Date, locale = 'en-us', showTime = true): string {
  let options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (showTime) {
    options = {
      ...options,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
  }

  return date.toLocaleDateString(locale, options);
}

export const setUTCStartOfDay = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const newDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  return newDate;
};

export const setUTCEndOfDay = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const newDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return newDate;
};

export const getDateWithoutTimeZone = (date: Date | undefined): Date => {
  if (!date) return new Date();

  const dateString = date.toISOString().replace('Z', '');

  return new Date(dateString);
};

export const convertToUTCISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
};
