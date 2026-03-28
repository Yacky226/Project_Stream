export function formatDate(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 'IN';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}

export function categoryColor(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('design')) {
    return 'from-indigo-500/25 to-sky-500/10';
  }
  if (key.includes('marketing')) {
    return 'from-emerald-500/25 to-teal-500/10';
  }
  if (key.includes('business')) {
    return 'from-amber-500/25 to-orange-500/10';
  }
  return 'from-[#1152d4]/25 to-cyan-500/10';
}

export function safeNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
