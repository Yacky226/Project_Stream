import { useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Loader2,
  RefreshCcw,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import { UserManagementTab } from '../admin/users/UserManagementTab';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EmptyState } from '../layout/EmptyState';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { StatCard, StatsGrid } from '../layout/StatsGrid';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Impossible de charger le dashboard administrateur.';
  }

  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };

  return (
    payload.data?.message ||
    payload.data?.error ||
    payload.error ||
    payload.message ||
    'Impossible de charger le dashboard administrateur.'
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status: string): string {
  if (status === 'TERMINE') {
    return 'Termine';
  }
  if (status === 'ABANDONNE') {
    return 'Abandonne';
  }
  return 'Actif';
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'TERMINE') {
    return 'default';
  }
  if (status === 'ABANDONNE') {
    return 'destructive';
  }
  return 'secondary';
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const shouldLoad = Boolean(isAuthenticated && user?.role === 'admin');

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAdminDashboardQuery(undefined, { skip: !shouldLoad });

  if (!authLoading && !isAuthenticated) {
    return (
      <PageContainer>
        <EmptyState
          icon={Shield}
          title="Connexion requise"
          description="Connectez-vous avec un compte administrateur."
          action={{
            label: 'Se connecter',
            onClick: () => onNavigate('/auth/signin'),
          }}
        />
      </PageContainer>
    );
  }

  if (!authLoading && isAuthenticated && user?.role !== 'admin') {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertCircle}
          title="Acces non autorise"
          description="Cette page est reservee aux administrateurs."
          action={{
            label: 'Retour',
            onClick: () => onNavigate('/'),
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard administrateur"
        description="Pilotage global des utilisateurs, cours et inscriptions."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
        }
      />

      {(isLoading || authLoading) && (
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{extractErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {!isLoading && data && (
        <div className="space-y-8">
          <StatsGrid columns={4}>
            <StatCard title="Utilisateurs" value={data.stats.totalUsers} icon={Users} />
            <StatCard title="Cours" value={data.stats.totalCourses} icon={BookOpen} />
            <StatCard title="Inscriptions" value={data.stats.totalEnrollments} icon={TrendingUp} />
            <StatCard title="Sessions live" value={data.stats.liveSessions} icon={BarChart3} />
          </StatsGrid>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue globale</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="courses">Cours</TabsTrigger>
              <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Repartition des comptes</CardTitle>
                    <CardDescription>Etat actuel de la base utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Etudiants</span>
                      <Badge>{data.stats.totalStudents}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enseignants</span>
                      <Badge>{data.stats.totalTeachers}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Administrateurs</span>
                      <Badge>{data.stats.totalAdmins}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Nouveaux comptes (30j)</span>
                      <Badge variant="outline">{data.stats.monthlyNewUsers}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>KPI plateforme</CardTitle>
                    <CardDescription>Indicateurs qualite et activite</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Inscriptions actives</span>
                      <Badge>{data.stats.activeEnrollments}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cours actifs</span>
                      <Badge>{data.stats.activeCourses}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Note moyenne des cours</span>
                      <Badge variant="outline">{data.stats.averageCourseRating.toFixed(2)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taux de completion moyen</span>
                      <Badge variant="outline">{data.stats.averageCompletionRate.toFixed(1)}%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagementTab />
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Derniers cours</CardTitle>
                  <CardDescription>Recuperes depuis /api/admin/courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cours</TableHead>
                        <TableHead>Enseignant</TableHead>
                        <TableHead>Inscriptions</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentCourses.map((course) => (
                        <TableRow
                          key={course.id}
                          className="cursor-pointer"
                          onClick={() => onNavigate(`/courses/${course.id}`)}
                        >
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{course.teacherName}</TableCell>
                          <TableCell>{course.enrollmentCount}</TableCell>
                          <TableCell>{course.sessionsCount}</TableCell>
                          <TableCell>{course.completionRate}%</TableCell>
                          <TableCell>
                            <Badge variant={course.isArchived ? 'outline' : 'default'}>
                              {course.isArchived ? 'Archive' : 'Actif'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(course.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                      {data.recentCourses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            Aucun cours disponible.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inscriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dernieres inscriptions</CardTitle>
                  <CardDescription>Recuperes depuis /api/admin/inscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Etudiant</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead>Enseignant</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date inscription</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentInscriptions.map((inscription) => (
                        <TableRow key={inscription.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{inscription.studentName}</p>
                              <p className="text-xs text-muted-foreground">{inscription.studentEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>{inscription.courseTitle}</TableCell>
                          <TableCell>{inscription.teacherName}</TableCell>
                          <TableCell>{inscription.progress}%</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(inscription.status)}>
                              {statusLabel(inscription.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(inscription.enrolledAt)}</TableCell>
                        </TableRow>
                      ))}
                      {data.recentInscriptions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            Aucune inscription disponible.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageContainer>
  );
}
