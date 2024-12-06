export function formatTime(time: string | undefined): string {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
} 