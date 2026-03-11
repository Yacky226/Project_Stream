export type NormalizedRole = 'student' | 'teacher' | 'admin';

function normalizeRoleToken(role?: string | null): string {
  if (!role) {
    return '';
  }

  const normalized = role
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return normalized.startsWith('ROLE_') ? normalized.slice(5) : normalized;
}

export function normalizeUserRole(role?: string | null): NormalizedRole {
  const token = normalizeRoleToken(role);

  if (token === 'TEACHER' || token === 'ENSEIGNANT') {
    return 'teacher';
  }

  if (token === 'ADMIN' || token === 'ADMINISTRATEUR') {
    return 'admin';
  }

  return 'student';
}

export function getUserRoleLabel(role?: string | null): string {
  const normalized = normalizeUserRole(role);

  if (normalized === 'teacher') {
    return 'Enseignant';
  }

  if (normalized === 'admin') {
    return 'Administrateur';
  }

  return 'Etudiant';
}
