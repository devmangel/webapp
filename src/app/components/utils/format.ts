export function formatDate(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return '';
  return value.toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return '';
  return value.toLocaleString('es-MX', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
}

export function formatPoints(points?: number) {
  if (typeof points !== 'number') return '—';
  return `${points} pts`;
}
