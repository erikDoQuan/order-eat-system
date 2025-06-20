import { sql } from 'drizzle-orm';

import { TimeUnit } from '~/common/interfaces/time-unit.interface';

export const TIMEZONE = 'UTC';

export function sqlDateRange(unit: TimeUnit) {
  const now = sql`NOW() AT TIME ZONE ${TIMEZONE}`;
  const intervals: Record<TimeUnit, string> = {
    [TimeUnit.Day]: '1 day',
    [TimeUnit.Week]: '1 week',
    [TimeUnit.Month]: '1 month',
  };
  const truncUnits: Partial<Record<TimeUnit, string>> = {
    [TimeUnit.Day]: 'day',
    [TimeUnit.Week]: 'week',
    [TimeUnit.Month]: 'month',
  };

  const truncUnit = truncUnits[unit];
  const start = sql`DATE_TRUNC(${sql.raw(`'${truncUnit}'`)}, ${now})`;
  const end = sql`DATE_TRUNC(${sql.raw(`'${truncUnit}'`)}, ${now}) + INTERVAL ${sql.raw(`'${intervals[unit]}'`)}`;

  return { start, end };
}
