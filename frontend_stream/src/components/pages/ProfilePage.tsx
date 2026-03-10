import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Edit, Loader2, Save, Shield, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/redux';
import { updateProfile as updateAuthProfile } from '../../store/slices/authSlice';
import {
  useGetAdminDashboardQuery,
  useGetStudentDashboardQuery,
  useGetTeacherDashboardQuery,
} from '../../store/api/dashboardApi';
import {
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetTeacherSpecialtyQuery,
  useUpdateProfileMutation,
} from '../../store/api/userApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';

interface ProfilePageProps {
  onNavigate: (path: string | number) => void;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
  dateNaissance: string;
  avatar: string;
}

interface RoleStat {
  label: string;
  value: string;
  description: string;
}

function toInputDate(value?: string | null): string {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parts = value.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  return '';
}

function getRoleLabel(role?: string): string {
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

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.trim() || 'U';
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetProfileQuery(undefined, { skip: !isAuthenticated });

  const { data: studentLevel } = useGetStudentLevelQuery(undefined, {
    skip: !profile || profile.role !== 'student',
  });
  const { data: teacherSpecialty } = useGetTeacherSpecialtyQuery(undefined, {
    skip: !profile || profile.role !== 'teacher',
  });
  const { data: studentDashboard, isFetching: studentStatsLoading } = useGetStudentDashboardQuery(
    undefined,
    {
      skip: !profile || profile.role !== 'student',
    },
  );
  const { data: teacherDashboard, isFetching: teacherStatsLoading } = useGetTeacherDashboardQuery(
    undefined,
    {
      skip: !profile || profile.role !== 'teacher',
    },
  );
  const { data: adminDashboard, isFetching: adminStatsLoading } = useGetAdminDashboardQuery(
    undefined,
    {
      skip: !profile || profile.role !== 'admin',
    },
  );

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    dateNaissance: '',
    avatar: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      onNavigate('/auth/signin');
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      dateNaissance: toInputDate(profile.dateNaissance),
      avatar: profile.avatar || '',
    });
  }, [profile]);

  const roleMeta = useMemo(() => {
    if (!profile) {
      return null;
    }

    if (profile.role === 'student') {
      return {
        label: 'Niveau',
        value: studentLevel || 'Non renseigne',
      };
    }

    if (profile.role === 'teacher') {
      return {
        label: 'Specialite',
        value: teacherSpecialty || 'Non renseignee',
      };
    }

    return {
      label: 'Acces',
      value: 'Administration',
    };
  }, [profile, studentLevel, teacherSpecialty]);

  const roleStats = useMemo<RoleStat[]>(() => {
    if (!profile) {
      return [];
    }

    if (profile.role === 'student' && studentDashboard) {
      return [
        {
          label: 'Cours inscrits',
          value: String(studentDashboard.stats.enrolledCourses),
          description: `${studentDashboard.stats.activeCourses} actifs`,
        },
        {
          label: 'Cours termines',
          value: String(studentDashboard.stats.completedCourses),
          description: 'Parcours finalises',
        },
        {
          label: 'Progression moyenne',
          value: `${studentDashboard.stats.averageProgress}%`,
          description: `${studentDashboard.stats.upcomingSessions} sessions a venir`,
        },
      ];
    }

    if (profile.role === 'teacher' && teacherDashboard) {
      return [
        {
          label: 'Cours geres',
          value: String(teacherDashboard.stats.totalCourses),
          description: `${teacherDashboard.stats.liveSessions} sessions live`,
        },
        {
          label: 'Etudiants inscrits',
          value: String(teacherDashboard.stats.totalStudents),
          description: `${teacherDashboard.stats.activeEnrollments} inscriptions actives`,
        },
        {
          label: 'Completion moyenne',
          value: `${teacherDashboard.stats.averageCompletionRate}%`,
          description: `${teacherDashboard.stats.upcomingSessions} sessions planifiees`,
        },
      ];
    }

    if (profile.role === 'admin' && adminDashboard) {
      return [
        {
          label: 'Utilisateurs',
          value: String(adminDashboard.stats.totalUsers),
          description: `${adminDashboard.stats.monthlyNewUsers} nouveaux (30j)`,
        },
        {
          label: 'Cours',
          value: String(adminDashboard.stats.totalCourses),
          description: `${adminDashboard.stats.activeCourses} actifs`,
        },
        {
          label: 'Inscriptions',
          value: String(adminDashboard.stats.totalEnrollments),
          description: `${adminDashboard.stats.averageCompletionRate}% completion moyenne`,
        },
      ];
    }

    return [];
  }, [profile, studentDashboard, teacherDashboard, adminDashboard]);

  const roleStatsLoading = useMemo(() => {
    if (!profile) {
      return false;
    }

    if (profile.role === 'student') {
      return studentStatsLoading;
    }
    if (profile.role === 'teacher') {
      return teacherStatsLoading;
    }
    if (profile.role === 'admin') {
      return adminStatsLoading;
    }
    return false;
  }, [profile, studentStatsLoading, teacherStatsLoading, adminStatsLoading]);

  const handleSave = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const updated = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateNaissance: form.dateNaissance || null,
        avatar: form.avatar.trim() || null,
      }).unwrap();

      dispatch(
        updateAuthProfile({
          firstName: updated.firstName,
          lastName: updated.lastName,
          avatar: updated.avatar,
          dateNaissance: updated.dateNaissance,
        }),
      );

      setSubmitSuccess('Profil mis a jour avec succes.');
      setIsEditing(false);
    } catch (error) {
      const payload = error as { data?: { message?: string; error?: string } };
      setSubmitError(payload?.data?.message || payload?.data?.error || 'Mise a jour impossible.');
    }
  };

  if (authLoading || profileLoading) {
    return (
      <PageContainer>
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger votre profil.</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="Mon profil"
        description="Informations personnelles connectees au backend."
        onBack={() => onNavigate(-1)}
      />

      {profileError && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Le profil n'a pas pu etre charge.</AlertDescription>
        </Alert>
      )}
      {submitError && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {submitSuccess && (
        <Alert className="mb-4">
          <AlertDescription>{submitSuccess}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.avatar || undefined} />
              <AvatarFallback>{getInitials(form.firstName, form.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {form.firstName} {form.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge>{getRoleLabel(profile.role)}</Badge>
                {roleMeta && (
                  <Badge variant="outline">
                    {roleMeta.label}: {roleMeta.value}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Ces donnees sont synchronisees avec l'API backend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name">Prenom</Label>
              <Input
                id="profile-first-name"
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last-name">Nom</Label>
              <Input
                id="profile-last-name"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={profile.email} disabled />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-birth-date">Date de naissance</Label>
              <Input
                id="profile-birth-date"
                type="date"
                value={form.dateNaissance}
                onChange={(event) => setForm((prev) => ({ ...prev, dateNaissance: event.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-avatar">URL photo profil</Label>
              <Input
                id="profile-avatar"
                value={form.avatar}
                onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
                placeholder="/Uploads/photos/..."
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="mb-1 text-xs text-muted-foreground">Type de compte</p>
              <p className="font-medium">
                <User className="mr-1 inline h-4 w-4" />
                {getRoleLabel(profile.role)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="mb-1 text-xs text-muted-foreground">Securite</p>
              <p className="font-medium">
                <Shield className="mr-1 inline h-4 w-4" />
                Compte actif
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="mb-1 text-xs text-muted-foreground">Acces API</p>
              <p className="font-medium">Synchronise</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-3 text-sm font-medium">Statistiques de role</p>
            {roleStatsLoading && (
              <div className="flex min-h-[72px] items-center justify-center rounded-lg border">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {!roleStatsLoading && roleStats.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {roleStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border p-3">
                    <p className="mb-1 text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                ))}
              </div>
            )}
            {!roleStatsLoading && roleStats.length === 0 && (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                Aucune statistique specifique disponible pour ce role.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
