import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getSecondBetweenTwoDates(startDate: Date, endDate: Date): number {
  const start = dayjs(endDate);
  const seconds = start.diff(startDate, 'second', true);

  return seconds;
}

export function addDaysToDate(date: Date, days: number): Date {
  const currentDate = dayjs(date);
  const newDate = currentDate.add(days, 'day');

  return newDate.toDate();
}
