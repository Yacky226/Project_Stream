import { mapBackendRole } from './auth';

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
  return mapBackendRole(role) as AdminUserRole;
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
    status: dto.actif === false ? 'inactive' : 'active',
    joinDate: dto.dateCreation || undefined,
    lastLogin: null,
    coursesCount: dto.nombreCours || 0,
    studentsCount: dto.nombreInscriptions || 0,
    specialite: dto.specialite,
    niveau: dto.niveau,
  };
}

export type AdminSupportStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface AdminSupportOverview {
  pendingContactRequests: number;
  newContactRequests: number;
  inProgressContactRequests: number;
  resolvedContactRequests: number;
  closedContactRequests: number;
  monthlyContactRequests: number;
  totalContactRequests: number;
  activeNewsletterSubscriptions: number;
  monthlyNewsletterSubscriptions: number;
}

export interface AdminSupportQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: AdminSortDirection;
  status?: AdminSupportStatus;
  search?: string;
}

export interface AdminSupportContactRequest {
  id: string;
  subject: string;
  status: AdminSupportStatus;
  sourcePage: string;
  fullName: string;
  email: string;
  preview: string;
  createdAt: string | null;
  processedAt: string | null;
  repliedAt: string | null;
  assignedAdminId: string | null;
  assignedAdminName: string | null;
  respondedByAdminName: string | null;
  ipAddress: string | null;
}

export interface AdminSupportContactRequestDetail extends AdminSupportContactRequest {
  message: string;
  internalNote: string | null;
  lastAdminReply: string | null;
}

export interface AdminSupportContactsPage {
  items: AdminSupportContactRequest[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminSupportStatusUpdatePayload {
  status: AdminSupportStatus;
}

export interface AdminSupportWorkflowUpdatePayload {
  status: AdminSupportStatus;
  assignedAdminId?: number | null;
  internalNote?: string | null;
}

export interface AdminSupportReplyPayload {
  message: string;
  status: AdminSupportStatus;
}

export interface AdminNewsletterQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: AdminSortDirection;
  active?: boolean;
  search?: string;
}

export interface AdminNewsletterSubscription {
  id: string;
  email: string;
  sourcePage: string;
  active: boolean;
  updatedAt: string | null;
}

export interface AdminNewsletterSubscriptionsPage {
  items: AdminNewsletterSubscription[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface BackendAdminSupportOverview {
  pendingContactRequests?: number;
  demandesContactEnAttente?: number;
  newContactRequests?: number;
  nouvellesDemandesContact?: number;
  inProgressContactRequests?: number;
  demandesContactEnCours?: number;
  resolvedContactRequests?: number;
  demandesContactResolues?: number;
  closedContactRequests?: number;
  demandesContactFermees?: number;
  monthlyContactRequests?: number;
  demandesContactMois?: number;
  totalContactRequests?: number;
  totalDemandesContact?: number;
  activeNewsletterSubscriptions?: number;
  newslettersActives?: number;
  monthlyNewsletterSubscriptions?: number;
  nouvellesNewslettersMois?: number;
}

export interface BackendAdminSupportContactRequest {
  id: number;
  sujet?: string | null;
  subject?: string | null;
  statut?: string | null;
  status?: string | null;
  sourcePage?: string | null;
  pageSource?: string | null;
  nomComplet?: string | null;
  fullName?: string | null;
  email?: string | null;
  preview?: string | null;
  apercu?: string | null;
  createdAt?: string | null;
  dateCreation?: string | null;
  processedAt?: string | null;
  dateTraitement?: string | null;
  repliedAt?: string | null;
  dateReponse?: string | null;
  assignedAdminId?: number | null;
  adminAssigneId?: number | null;
  assignedAdminName?: string | null;
  adminAssigneNom?: string | null;
  respondedByAdminName?: string | null;
  adminRepondeurNom?: string | null;
  ipAddress?: string | null;
  adresseIp?: string | null;
}

export interface BackendAdminSupportContactRequestDetail
  extends BackendAdminSupportContactRequest {
  message?: string | null;
  contenu?: string | null;
  internalNote?: string | null;
  noteInterne?: string | null;
  lastAdminReply?: string | null;
  derniereReponseAdmin?: string | null;
}

export interface BackendAdminNewsletterSubscription {
  id: number;
  email?: string | null;
  sourcePage?: string | null;
  pageSource?: string | null;
  active?: boolean | null;
  actif?: boolean | null;
  updatedAt?: string | null;
  dateMiseAJour?: string | null;
}

function toNumber(value: unknown): number {
  const normalized = typeof value === 'string' ? Number(value) : value;
  return typeof normalized === 'number' && Number.isFinite(normalized) ? normalized : 0;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function toSupportStatus(value: unknown): AdminSupportStatus {
  const normalized = String(value || 'NEW').trim().toUpperCase();
  if (normalized === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (normalized === 'RESOLVED') return 'RESOLVED';
  if (normalized === 'CLOSED') return 'CLOSED';
  return 'NEW';
}

export function mapBackendSupportOverview(
  dto: BackendAdminSupportOverview,
): AdminSupportOverview {
  return {
    pendingContactRequests: toNumber(dto.pendingContactRequests ?? dto.demandesContactEnAttente),
    newContactRequests: toNumber(dto.newContactRequests ?? dto.nouvellesDemandesContact),
    inProgressContactRequests: toNumber(dto.inProgressContactRequests ?? dto.demandesContactEnCours),
    resolvedContactRequests: toNumber(dto.resolvedContactRequests ?? dto.demandesContactResolues),
    closedContactRequests: toNumber(dto.closedContactRequests ?? dto.demandesContactFermees),
    monthlyContactRequests: toNumber(dto.monthlyContactRequests ?? dto.demandesContactMois),
    totalContactRequests: toNumber(dto.totalContactRequests ?? dto.totalDemandesContact),
    activeNewsletterSubscriptions: toNumber(
      dto.activeNewsletterSubscriptions ?? dto.newslettersActives,
    ),
    monthlyNewsletterSubscriptions: toNumber(
      dto.monthlyNewsletterSubscriptions ?? dto.nouvellesNewslettersMois,
    ),
  };
}

export function mapBackendSupportContactRequest(
  dto: BackendAdminSupportContactRequest,
): AdminSupportContactRequest {
  return {
    id: String(dto.id),
    subject: toNullableString(dto.subject ?? dto.sujet) || 'General Request',
    status: toSupportStatus(dto.status ?? dto.statut),
    sourcePage: toNullableString(dto.sourcePage ?? dto.pageSource) || 'UNKNOWN',
    fullName: toNullableString(dto.fullName ?? dto.nomComplet) || 'Unknown contact',
    email: toNullableString(dto.email) || 'unknown@example.com',
    preview: toNullableString(dto.preview ?? dto.apercu) || 'No preview available.',
    createdAt: toNullableString(dto.createdAt ?? dto.dateCreation),
    processedAt: toNullableString(dto.processedAt ?? dto.dateTraitement),
    repliedAt: toNullableString(dto.repliedAt ?? dto.dateReponse),
    assignedAdminId:
      dto.assignedAdminId != null || dto.adminAssigneId != null
        ? String(dto.assignedAdminId ?? dto.adminAssigneId)
        : null,
    assignedAdminName: toNullableString(dto.assignedAdminName ?? dto.adminAssigneNom),
    respondedByAdminName: toNullableString(
      dto.respondedByAdminName ?? dto.adminRepondeurNom,
    ),
    ipAddress: toNullableString(dto.ipAddress ?? dto.adresseIp),
  };
}

export function mapBackendSupportContactRequestDetail(
  dto: BackendAdminSupportContactRequestDetail,
): AdminSupportContactRequestDetail {
  const base = mapBackendSupportContactRequest(dto);
  return {
    ...base,
    message: toNullableString(dto.message ?? dto.contenu) || 'No message available.',
    internalNote: toNullableString(dto.internalNote ?? dto.noteInterne),
    lastAdminReply: toNullableString(dto.lastAdminReply ?? dto.derniereReponseAdmin),
  };
}

export function mapBackendNewsletterSubscription(
  dto: BackendAdminNewsletterSubscription,
): AdminNewsletterSubscription {
  return {
    id: String(dto.id),
    email: toNullableString(dto.email) || 'unknown@example.com',
    sourcePage: toNullableString(dto.sourcePage ?? dto.pageSource) || 'UNKNOWN',
    active: Boolean(dto.active ?? dto.actif),
    updatedAt: toNullableString(dto.updatedAt ?? dto.dateMiseAJour),
  };
}
