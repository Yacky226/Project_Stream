import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  useCreateAdminUserMutation,
  useCreateStudentUserMutation,
  useCreateTeacherUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useToggleAdminUserStatusMutation,
  useUpdateAdminUserMutation,
} from '../../../store/api/adminUserApi';
import type { AdminRoleFilter, AdminSortDirection, AdminUser } from '../../../types/admin';
import {
  buildUsersCsv,
  downloadCsv,
  extractApiError,
  getRoleLabel,
  getStatusLabel,
} from './userManagement.utils';

type CreateRole = 'student' | 'teacher' | 'admin';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortField = 'dateCreation' | 'nom' | 'email' | 'role';

interface CreateUserFormState {
  role: CreateRole;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialite: string;
  niveau: string;
}

interface EditUserFormState {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  niveau: string;
}

const initialCreateForm: CreateUserFormState = {
  role: 'student',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  specialite: '',
  niveau: 'DEBUTANT',
};

function getInitials(user: AdminUser): string {
  const first = user.prenom?.charAt(0) || '';
  const last = user.nom?.charAt(0) || '';
  const initials = `${first}${last}`.trim();
  return initials || user.name.charAt(0) || 'U';
}

function buildEditState(user: AdminUser): EditUserFormState {
  return {
    id: user.id,
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email,
    specialite: user.specialite || '',
    niveau: user.niveau || '',
  };
}

function mapRoleFilterToApi(roleFilter: string): AdminRoleFilter | undefined {
  if (roleFilter === 'ETUDIANT' || roleFilter === 'ENSEIGNANT' || roleFilter === 'ADMINISTRATEUR') {
    return roleFilter;
  }
  return undefined;
}

function mapStatusToActif(status: StatusFilter): boolean | undefined {
  if (status === 'all') {
    return undefined;
  }
  return status === 'active';
}

export function UserManagementTab() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('dateCreation');
  const [sortDir, setSortDir] = useState<AdminSortDirection>('DESC');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserFormState>(initialCreateForm);
  const [editForm, setEditForm] = useState<EditUserFormState | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [createAdminUser, createAdminState] = useCreateAdminUserMutation();
  const [createTeacherUser, createTeacherState] = useCreateTeacherUserMutation();
  const [createStudentUser, createStudentState] = useCreateStudentUserMutation();
  const [updateAdminUser, updateState] = useUpdateAdminUserMutation();
  const [toggleAdminUserStatus, toggleState] = useToggleAdminUserStatusMutation();
  const [deleteAdminUser, deleteState] = useDeleteAdminUserMutation();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [roleFilter, statusFilter, sortField, sortDir, pageSize]);

  const queryParams = useMemo(
    () => ({
      page,
      size: pageSize,
      sortBy: sortField,
      sortDir,
      role: mapRoleFilterToApi(roleFilter),
      actif: mapStatusToActif(statusFilter),
      search: searchTerm || undefined,
    }),
    [page, pageSize, sortField, sortDir, roleFilter, statusFilter, searchTerm],
  );

  const {
    data: usersPage,
    isLoading,
    isFetching,
    error: listError,
  } = useGetAdminUsersQuery(queryParams);

  const users = usersPage?.items || [];
  const totalElements = usersPage?.totalElements || 0;
  const totalPages = usersPage?.totalPages || 0;
  const safeTotalPages = totalPages > 0 ? totalPages : 1;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const isMutationLoading =
    createAdminState.isLoading ||
    createTeacherState.isLoading ||
    createStudentState.isLoading ||
    updateState.isLoading ||
    toggleState.isLoading ||
    deleteState.isLoading;

  const resetFeedback = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  const openCreateDialog = () => {
    resetFeedback();
    setCreateForm(initialCreateForm);
    setCreateOpen(true);
  };

  const openEditDialog = (user: AdminUser) => {
    resetFeedback();
    setSelectedUser(user);
    setEditForm(buildEditState(user));
    setEditOpen(true);
  };

  const handleExport = () => {
    const csv = buildUsersCsv(users);
    downloadCsv(`users_page_${page + 1}_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (createForm.password.length < 8) {
      setActionError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    try {
      if (createForm.role === 'admin') {
        await createAdminUser({
          nom: createForm.lastName.trim(),
          prenom: createForm.firstName.trim(),
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          role: 'ADMINISTRATEUR',
        }).unwrap();
      } else if (createForm.role === 'teacher') {
        if (!createForm.specialite.trim()) {
          setActionError('La specialite est obligatoire pour un enseignant.');
          return;
        }

        await createTeacherUser({
          nom: createForm.lastName.trim(),
          prenom: createForm.firstName.trim(),
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          role: 'ENSEIGNANT',
          specialite: createForm.specialite.trim(),
        }).unwrap();
      } else {
        if (!createForm.niveau.trim()) {
          setActionError('Le niveau est obligatoire pour un etudiant.');
          return;
        }

        await createStudentUser({
          nom: createForm.lastName.trim(),
          prenom: createForm.firstName.trim(),
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          role: 'ETUDIANT',
          niveau: createForm.niveau.trim(),
        }).unwrap();
      }

      setActionSuccess('Utilisateur cree avec succes.');
      setCreateOpen(false);
      setCreateForm(initialCreateForm);
    } catch (error) {
      setActionError(extractApiError(error, 'Creation utilisateur impossible.'));
    }
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (!selectedUser || !editForm) {
      return;
    }

    try {
      await updateAdminUser({
        id: selectedUser.id,
        payload: {
          nom: editForm.nom.trim(),
          prenom: editForm.prenom.trim(),
          email: editForm.email.trim().toLowerCase(),
          specialite:
            selectedUser.role === 'teacher' ? editForm.specialite.trim() || undefined : undefined,
          niveau: selectedUser.role === 'student' ? editForm.niveau.trim() || undefined : undefined,
        },
      }).unwrap();

      setActionSuccess('Utilisateur mis a jour.');
      setEditOpen(false);
      setSelectedUser(null);
      setEditForm(null);
    } catch (error) {
      setActionError(extractApiError(error, 'Mise a jour impossible.'));
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    resetFeedback();
    try {
      const shouldActivate = user.status !== 'active';
      await toggleAdminUserStatus({ id: user.id, actif: shouldActivate }).unwrap();
      setActionSuccess(shouldActivate ? 'Utilisateur active.' : 'Utilisateur desactive.');
    } catch (error) {
      setActionError(extractApiError(error, 'Impossible de modifier le statut.'));
    }
  };

  const handleDelete = async (user: AdminUser) => {
    resetFeedback();
    const confirmed = window.confirm(`Supprimer le compte de ${user.name} ?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminUser(user.id).unwrap();
      setActionSuccess('Utilisateur supprime.');
    } catch (error) {
      setActionError(extractApiError(error, 'Suppression utilisateur impossible.'));
    }
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}
      {listError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {extractApiError(listError, 'Chargement des utilisateurs impossible.')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous roles</SelectItem>
            <SelectItem value="ETUDIANT">Etudiants</SelectItem>
            <SelectItem value="ENSEIGNANT">Enseignants</SelectItem>
            <SelectItem value="ADMINISTRATEUR">Administrateurs</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
          <SelectTrigger>
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateCreation">Date creation</SelectItem>
            <SelectItem value="nom">Nom</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="role">Role</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Select value={sortDir} onValueChange={(value) => setSortDir(value as AdminSortDirection)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Desc</SelectItem>
              <SelectItem value="ASC">Asc</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            Utilisateurs ({totalElements})
            {(isLoading || isFetching) && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} disabled={users.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date creation</TableHead>
                <TableHead>Statistiques</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.joinDate ? new Date(user.joinDate).toLocaleDateString('fr-FR') : '-'}
                  </TableCell>
                  <TableCell>
                    {user.role === 'teacher' && (
                      <div className="text-sm">
                        <div>{user.coursesCount || 0} cours</div>
                        <div className="text-muted-foreground">{user.studentsCount || 0} inscriptions</div>
                      </div>
                    )}
                    {user.role === 'student' && (
                      <span className="text-sm text-muted-foreground">
                        {(user.studentsCount || 0).toString()} inscriptions
                      </span>
                    )}
                    {user.role === 'admin' && <span className="text-sm text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(user)}
                        disabled={isMutationLoading}
                        aria-label={`Modifier ${user.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(user)}
                        disabled={isMutationLoading}
                        aria-label={
                          user.status === 'active'
                            ? `Desactiver ${user.name}`
                            : `Activer ${user.name}`
                        }
                      >
                        {user.status === 'active' ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user)}
                        disabled={isMutationLoading}
                        aria-label={`Supprimer ${user.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucun utilisateur trouve.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Page {Math.min(page + 1, safeTotalPages)} / {safeTotalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page <= 0 || isFetching}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Precedent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= safeTotalPages - 1 || isFetching}
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Creer un utilisateur</DialogTitle>
            <DialogDescription>Ajouter un nouveau compte a la plateforme.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-first-name">Prenom</Label>
                <Input
                  id="create-first-name"
                  value={createForm.firstName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-last-name">Nom</Label>
                <Input
                  id="create-last-name"
                  value={createForm.lastName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-role">Role</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, role: value as CreateRole }))
                  }
                >
                  <SelectTrigger id="create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Etudiant</SelectItem>
                    <SelectItem value="teacher">Enseignant</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Mot de passe</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  minLength={8}
                  required
                />
              </div>
            </div>

            {createForm.role === 'teacher' && (
              <div className="space-y-2">
                <Label htmlFor="create-specialite">Specialite</Label>
                <Input
                  id="create-specialite"
                  value={createForm.specialite}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, specialite: event.target.value }))
                  }
                  required
                />
              </div>
            )}

            {createForm.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="create-niveau">Niveau</Label>
                <Input
                  id="create-niveau"
                  value={createForm.niveau}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, niveau: event.target.value }))
                  }
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isMutationLoading}>
                {isMutationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Creer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedUser(null);
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier utilisateur</DialogTitle>
            <DialogDescription>Mettre a jour les informations du compte.</DialogDescription>
          </DialogHeader>

          {selectedUser && editForm && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">Prenom</Label>
                  <Input
                    id="edit-first-name"
                    value={editForm.prenom}
                    onChange={(event) =>
                      setEditForm((prev) => (prev ? { ...prev, prenom: event.target.value } : prev))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Nom</Label>
                  <Input
                    id="edit-last-name"
                    value={editForm.nom}
                    onChange={(event) =>
                      setEditForm((prev) => (prev ? { ...prev, nom: event.target.value } : prev))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                  }
                  required
                />
              </div>

              {selectedUser.role === 'teacher' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-specialite">Specialite</Label>
                  <Input
                    id="edit-specialite"
                    value={editForm.specialite}
                    onChange={(event) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, specialite: event.target.value } : prev,
                      )
                    }
                    required
                  />
                </div>
              )}

              {selectedUser.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-niveau">Niveau</Label>
                  <Input
                    id="edit-niveau"
                    value={editForm.niveau}
                    onChange={(event) =>
                      setEditForm((prev) => (prev ? { ...prev, niveau: event.target.value } : prev))
                    }
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isMutationLoading}>
                  {isMutationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
