import type { AdminUser, AdminUserRole, AdminUserStatus } from '../../../types/admin';

export type UserFilter = 'all' | AdminUserRole | AdminUserStatus;

export function getRoleLabel(role: AdminUserRole): string {
  switch (role) {
    case 'teacher':
      return 'Enseignant';
    case 'admin':
      return 'Administrateur';
    case 'student':
    default:
      return 'Etudiant';
  }
}

export function getStatusLabel(status: AdminUserStatus): string {
  return status === 'active' ? 'Actif' : 'Inactif';
}

export function matchesUserFilter(user: AdminUser, filter: UserFilter, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch =
    normalizedSearch.length === 0 ||
    user.name.toLowerCase().includes(normalizedSearch) ||
    user.email.toLowerCase().includes(normalizedSearch);

  if (filter === 'all') {
    return matchesSearch;
  }

  if (filter === 'active' || filter === 'inactive') {
    return user.status === filter && matchesSearch;
  }

  return user.role === filter && matchesSearch;
}

export function buildUsersCsv(users: AdminUser[]): string {
  const rows = [
    ['Nom', 'Email', 'Role', 'Statut', 'Date creation'],
    ...users.map((user) => [
      user.name,
      user.email,
      getRoleLabel(user.role),
      getStatusLabel(user.status),
      user.joinDate ? new Date(user.joinDate).toLocaleDateString('fr-FR') : '-',
    ]),
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function extractApiError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };

  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}
