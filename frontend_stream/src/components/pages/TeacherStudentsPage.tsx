import { useMemo, useState } from 'react';
import { AlertCircle, RefreshCcw, Search, Users } from 'lucide-react';
import { useGetTeacherStudentsQuery } from '../../store/api/liveApi';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import { Alert, AlertDescription } from '../ui/alert';

interface TeacherStudentsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };
  return payload.data?.message || payload.data?.error || payload.error || payload.message || fallback;
}

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizeStatusLabel(status: string) {
  if (status === 'ACTIF' || status === 'ACTIVE') {
    return { label: 'Actif', className: 'bg-green-100 text-green-700' };
  }
  if (status === 'TERMINE' || status === 'COMPLETED') {
    return { label: 'Termine', className: 'bg-blue-100 text-blue-700' };
  }
  if (status === 'ABANDONNE' || status === 'ABANDONED') {
    return { label: 'Abandonne', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: status, className: 'bg-slate-100 text-slate-700' };
}

export function TeacherStudentsPage({ onNavigate, currentPath }: TeacherStudentsPageProps) {
  const shared = useTeacherSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useGetTeacherStudentsQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  if (shared.status !== 'ready') {
    return <TeacherSpaceStatus shared={shared} />;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allRows = data?.enrollments ?? [];

  const filteredRows = useMemo(() => {
    if (!normalizedQuery) return allRows;
    return allRows.filter((row) =>
      `${row.studentName} ${row.courseTitle} ${row.status}`.toLowerCase().includes(normalizedQuery),
    );
  }, [allRows, normalizedQuery]);

  const uniqueStudentsCount =
    data?.uniqueStudents ?? new Set(filteredRows.map((item) => item.studentId)).size;
  const activeCount =
    data?.activeEnrollments ??
    filteredRows.filter((item) => item.status === 'ACTIF' || item.status === 'ACTIVE').length;
  const coursesCount = data?.coursesCount ?? 0;

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      showSearch={false}
      showHeader={false}
      headerTitle="Students"
      displayName={shared.displayName}
      displayRole={shared.displayRole}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      activeCourseCount={shared.activeCourseCount}
      liveSessions={shared.liveSessions}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Students</h1>
            <p className="mt-2 text-sm text-slate-500">
              Liste des etudiants inscrits dans vos cours.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Students</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{uniqueStudentsCount}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Active Enrollments
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{activeCount}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">My Courses</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{coursesCount}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-slate-950">Enrolled Students</h2>

            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher etudiant ou cours..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
                type="text"
              />
            </div>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {extractErrorMessage(error, 'Impossible de charger la liste des etudiants.')}
              </AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-2 py-3">Student</th>
                    <th className="px-2 py-3">Course</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Progress</th>
                    <th className="px-2 py-3">Enrolled At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((row) => {
                    const status = normalizeStatusLabel(row.status);
                    return (
                      <tr key={row.enrollmentId} className="hover:bg-slate-50">
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{row.studentName}</p>
                              <p className="text-xs text-slate-500">ID: {row.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <p className="text-sm font-medium text-slate-900">{row.courseTitle}</p>
                        </td>
                        <td className="px-2 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-2 py-4">
                          <div className="w-28">
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${row.progress}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-600">{row.progress}%</p>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm text-slate-600">{formatDate(row.enrolledAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-base font-semibold text-slate-900">Aucun etudiant trouve.</p>
              <p className="mt-2 text-sm text-slate-500">
                Quand des etudiants s inscrivent a vos cours, ils apparaissent ici.
              </p>
            </div>
          )}
        </section>
      </div>
    </TeacherSpaceShell>
  );
}
