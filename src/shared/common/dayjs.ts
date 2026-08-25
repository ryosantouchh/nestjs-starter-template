import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const BANGKOK_TZ = 'Asia/Bangkok';
export const tzDayjs = (date?: dayjs.ConfigType) => dayjs(date).tz(BANGKOK_TZ);
