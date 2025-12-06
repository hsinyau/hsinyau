import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDate(dateString: string | number, type?: 'YYYY-MM-DD' | string): string {
  const date = dayjs.tz(dateString, 'Asia/Shanghai');

  if (!date.isValid()) {
    throw new Error('Invalid date string');
  }

  if (type === 'YYYY-MM-DD') {
    return date.format('YYYY-MM-DD');
  } else {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
}
