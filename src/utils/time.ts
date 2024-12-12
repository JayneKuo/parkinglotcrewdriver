import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * 计算两个时间之间的持续时间
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 格式化后的持续时间字符串
 */
export function calculateDuration(startTime: string, endTime: string): string {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const diff = end.diff(start);
  const durationObj = dayjs.duration(diff);

  const hours = Math.floor(durationObj.asHours());
  const minutes = durationObj.minutes();

  if (hours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} mins`;
  }
}

/**
 * 格式化时间为相对时间
 * @param time 时间字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(time: string): string {
  return dayjs(time).fromNow();
}

/**
 * 检查时间是否过期
 * @param time 时间字符串
 * @returns 是否过期
 */
export function isExpired(time: string): boolean {
  return dayjs(time).isBefore(dayjs());
}

/**
 * 格式化时间范围
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 格式化后的时间范围字符串
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  
  if (start.isSame(end, 'day')) {
    return `${start.format('MMM D, YYYY')} ${start.format('HH:mm')} - ${end.format('HH:mm')}`;
  } else {
    return `${start.format('MMM D, YYYY HH:mm')} - ${end.format('MMM D, YYYY HH:mm')}`;
  }
}

/**
 * 获取剩余时间
 * @param endTime 结束时间
 * @returns 剩余时间字符串
 */
export function getRemainingTime(endTime: string): string {
  const end = dayjs(endTime);
  const now = dayjs();
  const diff = end.diff(now);
  const duration = dayjs.duration(diff);

  if (diff < 0) {
    return 'Expired';
  }

  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  if (hours === 0) {
    return `${minutes}m remaining`;
  } else {
    return `${hours}h ${minutes}m remaining`;
  }
} 