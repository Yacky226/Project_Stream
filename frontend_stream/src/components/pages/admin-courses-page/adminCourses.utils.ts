export function compact(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 0 : 1,
  }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function escapeCsvCell(value: string | number) {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
