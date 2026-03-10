export type AdminUserRole = 'student' | 'teacher' | 'admin';
export type AdminUserStatus = 'active' | 'inactive';

export interface BackendAdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
  dateCreation?: string;
  nombreCours?: number;
  nombreInscriptions?: number;
  nombreSessions?: number;
  specialite?: string;
  niveau?: string;
  photoProfil?: string | null;
}

export interface BackendPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type AdminSortDirection = 'ASC' | 'DESC';
export type AdminRoleFilter = 'ETUDIANT' | 'ENSEIGNANT' | 'ADMINISTRATEUR';

export interface AdminUsersQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: AdminSortDirection;
  role?: AdminRoleFilter;
  actif?: boolean;
  search?: string;
}

export interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  name: string;
  email: string;
  role: AdminUserRole;
  avatar?: string | null;
  status: AdminUserStatus;
  joinDate?: string;
  lastLogin?: string | null;
  coursesCount?: number;
  studentsCount?: number;
  specialite?: string;
  niveau?: string;
}

export interface AdminUsersPage {
  items: AdminUser[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminUserUpdatePayload {
  nom: string;
  prenom: string;
  email: string;
  specialite?: string;
  niveau?: string;
}

export interface CreateAdminPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'ADMINISTRATEUR';
  dateNaissance?: string;
}

export interface CreateTeacherPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'ENSEIGNANT';
  specialite: string;
  dateNaissance?: string;
}

export interface CreateStudentPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'ETUDIANT';
  niveau: string;
  dateNaissance?: string;
}

export function mapAdminRole(role: string): AdminUserRole {
  switch (role) {
    case 'ENSEIGNANT':
      return 'teacher';
    case 'ADMINISTRATEUR':
      return 'admin';
    case 'ETUDIANT':
    default:
      return 'student';
  }
}

export function mapBackendAdminUser(dto: BackendAdminUser): AdminUser {
  return {
    id: String(dto.id),
    nom: dto.nom || '',
    prenom: dto.prenom || '',
    name: `${dto.prenom || ''} ${dto.nom || ''}`.trim(),
    email: dto.email,
    role: mapAdminRole(dto.role),
    avatar: dto.photoProfil || null,
    status: dto.actif ? 'active' : 'inactive',
    joinDate: dto.dateCreation || undefined,
    lastLogin: null,
    coursesCount: dto.nombreCours || 0,
    studentsCount: dto.nombreInscriptions || 0,
    specialite: dto.specialite,
    niveau: dto.niveau,
  };
}
