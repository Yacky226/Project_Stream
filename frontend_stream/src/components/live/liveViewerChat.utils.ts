export function formatMessageClock(value?: string | null): string {
  if (!value) {
    return '--:--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function initialsFromName(name?: string | null): string {
  if (!name) {
    return '??';
  }

  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return '??';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
