import { useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ShoppingCart,
  UserPlus,
  Users,
} from 'lucide-react';
import { useGetAdminUsersQuery } from '../../../store/api/adminUserApi';
import { useGetAdminDashboardQuery } from '../../../store/api/dashboardApi';
import type { AdminUserRole } from '../../../types/admin';
import { useAdminSpaceData } from '../../admin/AdminSpaceShared';
import {
  buildAreaPath,
  buildChartPoints,
  buildCurvedLinePath,
  buildGrowthSeries,
  compact,
  dateValue,
  extractErrorMessage,
  formatRelativeDate,
  roleLabel,
  splitName,
} from '../../admin/dashboard/adminDashboard.utils';

export interface DashboardUserRow {
  id: string;
  nom?: string;
  prenom?: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: 'active' | 'inactive';
  joinDate?: string;
  avatar?: string | null;
}

export type GrowthRange = '6m' | '12m';

interface AdminKpiItem {
  title: string;
  value: string;
  trend: string;
  trendClass: string;
  icon: typeof ShoppingCart;
}

interface AdminActivityItem {
  id: string;
  icon: typeof UserPlus;
  iconWrap: string;
  title: string;
  time: string;
  occurredAt: number;
}

interface ModerationTask {
  id: string;
  label: string;
  severity: 'high' | 'medium';
  title: string;
  time: string;
  occurredAt: number;
}

export interface AdminDashboardDataModel {
  shared: ReturnType<typeof useAdminSpaceData>;
  data: ReturnType<typeof useGetAdminDashboardQuery>['data'];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  growthRange: GrowthRange;
  setGrowthRange: (value: GrowthRange) => void;
  refetch: () => void;
  dashboardLoading: boolean;
  dashboardFetching: boolean;
  dashboardError: unknown;
  usersLoading: boolean;
  usersFetching: boolean;
  usersError: unknown;
  usersErrorMessage: string | null;
  displayedUsers: DashboardUserRow[];
  fallbackUsers: DashboardUserRow[];
  kpis: AdminKpiItem[];
  growthSeries: ReturnType<typeof buildGrowthSeries>;
  growthPoints: ReturnType<typeof buildChartPoints>;
  growthLine: string;
  growthArea: string;
  recentActivity: AdminActivityItem[];
  moderationTasks: ModerationTask[];
  highPriorityCount: number;
}

export function useAdminDashboardData(): AdminDashboardDataModel {
  const shared = useAdminSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQueryState] = useState('');
  const [growthRange, setGrowthRangeState] = useState<GrowthRange>('6m');
  const shouldLoad = shared.status === 'ready';
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const {
    data,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    error: dashboardError,
    refetch,
  } = useGetAdminDashboardQuery(undefined, { skip: !shouldLoad });

  const {
    data: usersPage,
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
  } = useGetAdminUsersQuery(
    {
      page: 0,
      size: 6,
      sortBy: 'id',
      sortDir: 'DESC',
      search: normalizedSearch || undefined,
    },
    {
      skip: !shouldLoad,
    },
  );

  const stats = data?.stats;
  const recentInscriptions = useMemo(() => {
    const allInscriptions = data?.recentInscriptions || [];
    if (!normalizedSearch) return allInscriptions;
    return allInscriptions.filter((item) =>
      `${item.studentName} ${item.studentEmail} ${item.courseTitle} ${item.teacherName}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [data?.recentInscriptions, normalizedSearch]);

  const filteredCourses = useMemo(() => {
    const allCourses = data?.recentCourses || [];
    if (!normalizedSearch) return allCourses;
    return allCourses.filter((course) =>
      `${course.title} ${course.teacherName}`.toLowerCase().includes(normalizedSearch),
    );
  }, [data?.recentCourses, normalizedSearch]);

  const recentUsers: DashboardUserRow[] = (usersPage?.items || []).slice(0, 3);
  const fallbackUsers = useMemo<DashboardUserRow[]>(() => {
    const rowsByKey = new Map<string, DashboardUserRow>();

    recentInscriptions.slice(0, 8).forEach((inscription) => {
      const fullName = inscription.studentName || 'Learner';
      const names = splitName(fullName);
      const row: DashboardUserRow = {
        id: `inscription-${inscription.id}`,
        nom: names.nom,
        prenom: names.prenom,
        name: fullName,
        email: inscription.studentEmail || `student-${inscription.id}@unknown.local`,
        role: 'student',
        status: inscription.status.toUpperCase() === 'ABANDONNE' ? 'inactive' : 'active',
        joinDate: inscription.enrolledAt || undefined,
      };
      rowsByKey.set(`${row.role}:${row.email}`, row);
    });

    filteredCourses.slice(0, 8).forEach((course) => {
      const teacherName = course.teacherName?.trim();
      if (!teacherName || teacherName.toUpperCase() === 'N/A') return;

      const names = splitName(teacherName);
      const row: DashboardUserRow = {
        id: `course-${course.id}`,
        nom: names.nom,
        prenom: names.prenom,
        name: teacherName,
        email: `teacher-${course.id}@unknown.local`,
        role: 'teacher',
        status: course.isArchived ? 'inactive' : 'active',
        joinDate: course.createdAt || undefined,
      };
      rowsByKey.set(`${row.role}:${row.name.toLowerCase()}`, row);
    });

    return Array.from(rowsByKey.values()).slice(0, 3);
  }, [filteredCourses, recentInscriptions]);
  const usersErrorMessage = usersError
    ? extractErrorMessage(usersError, 'Unable to load user list.')
    : null;
  const displayedUsers = usersError ? fallbackUsers : recentUsers;

  const kpis: AdminKpiItem[] = useMemo(
    () => [
      {
        title: 'Total Enrollments',
        value: compact(stats?.totalEnrollments || 0),
        trend: `${compact(stats?.monthlyEnrollments || 0)} this month`,
        trendClass: 'text-[#1152d4] bg-[#1152d4]/10',
        icon: ShoppingCart,
      },
      {
        title: 'Total Users',
        value: compact(stats?.totalUsers || 0),
        trend: `${compact(stats?.totalStudents || 0)} students`,
        trendClass: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
        icon: Users,
      },
      {
        title: 'Completion Rate',
        value: `${Math.round(stats?.averageCompletionRate || 0)}%`,
        trend:
          (stats?.averageCourseRating || 0) > 0
            ? `${(stats?.averageCourseRating || 0).toFixed(1)}/5 rating`
            : 'No rating yet',
        trendClass: 'text-[#1152d4] bg-[#1152d4]/10',
        icon: BarChart3,
      },
      {
        title: 'New Signups (30d)',
        value: compact(stats?.monthlyNewUsers || 0),
        trend: `${compact(stats?.liveSessions || 0)} live sessions`,
        trendClass: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
        icon: UserPlus,
      },
    ],
    [stats],
  );

  const growthSeries = useMemo(
    () => buildGrowthSeries(recentInscriptions, growthRange),
    [growthRange, recentInscriptions],
  );
  const growthPoints = useMemo(
    () => buildChartPoints(growthSeries.values, 720, 220),
    [growthSeries.values],
  );
  const growthLine = useMemo(() => buildCurvedLinePath(growthPoints), [growthPoints]);
  const growthArea = useMemo(() => buildAreaPath(growthPoints, 220), [growthPoints]);

  const recentActivity = useMemo<AdminActivityItem[]>(() => {
    const userEvents = displayedUsers.map((userItem) => ({
      id: `new-user-${userItem.id}`,
      icon: UserPlus,
      iconWrap: 'bg-blue-50 text-[#1152d4] dark:bg-blue-900/20 dark:text-blue-300',
      title: `New ${roleLabel(userItem.role)}: ${userItem.name || userItem.email}`,
      time: formatRelativeDate(userItem.joinDate),
      occurredAt: dateValue(userItem.joinDate),
    }));

    const inscriptionEvents = recentInscriptions.slice(0, 8).map((inscription) => ({
      id: `inscription-${inscription.id}`,
      icon: ShoppingCart,
      iconWrap: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-300',
      title: `${inscription.studentName} enrolled in "${inscription.courseTitle}"`,
      time: formatRelativeDate(inscription.enrolledAt),
      occurredAt: dateValue(inscription.enrolledAt),
    }));

    const courseEvents = filteredCourses.slice(0, 8).map((course) => ({
      id: `course-${course.id}`,
      icon: BookOpen,
      iconWrap: 'bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-300',
      title: `Course published: "${course.title}"`,
      time: formatRelativeDate(course.createdAt),
      occurredAt: dateValue(course.createdAt),
    }));

    return [...userEvents, ...inscriptionEvents, ...courseEvents]
      .sort((left, right) => right.occurredAt - left.occurredAt)
      .slice(0, 4);
  }, [displayedUsers, filteredCourses, recentInscriptions]);

  const moderationTasks = useMemo<ModerationTask[]>(() => {
    const lowRatedCourses = filteredCourses
      .filter((course) => course.averageRating > 0 && course.averageRating < 3.5)
      .map((course) => ({
        id: `rating-${course.id}`,
        label: 'Quality Flag',
        severity: 'high' as const,
        title: `Course "${course.title}" dropped below 3.5 rating`,
        time: formatRelativeDate(course.createdAt),
        occurredAt: dateValue(course.createdAt),
      }));

    const abandonedEnrollments = recentInscriptions
      .filter((inscription) => inscription.status.toUpperCase() === 'ABANDONNE')
      .map((inscription) => ({
        id: `abandon-${inscription.id}`,
        label: 'Dropout Alert',
        severity: 'high' as const,
        title: `${inscription.studentName} abandoned "${inscription.courseTitle}"`,
        time: formatRelativeDate(inscription.lastActivityAt || inscription.enrolledAt),
        occurredAt: dateValue(inscription.lastActivityAt || inscription.enrolledAt),
      }));

    const stalledProgress = recentInscriptions
      .filter(
        (inscription) =>
          inscription.status.toUpperCase() === 'ACTIF' &&
          inscription.progress > 0 &&
          inscription.progress < 20,
      )
      .map((inscription) => ({
        id: `stalled-${inscription.id}`,
        label: 'Low Progress',
        severity: 'medium' as const,
        title: `${inscription.studentName} is below 20% in "${inscription.courseTitle}"`,
        time: formatRelativeDate(inscription.lastActivityAt || inscription.enrolledAt),
        occurredAt: dateValue(inscription.lastActivityAt || inscription.enrolledAt),
      }));

    return [...lowRatedCourses, ...abandonedEnrollments, ...stalledProgress]
      .sort((left, right) => right.occurredAt - left.occurredAt)
      .slice(0, 3);
  }, [filteredCourses, recentInscriptions]);

  const highPriorityCount = moderationTasks.filter((task) => task.severity === 'high').length;

  return {
    shared,
    data,
    searchQuery,
    setSearchQuery: setSearchQueryState,
    growthRange,
    setGrowthRange: setGrowthRangeState,
    refetch,
    dashboardLoading,
    dashboardFetching,
    dashboardError,
    usersLoading,
    usersFetching,
    usersError,
    usersErrorMessage,
    displayedUsers,
    fallbackUsers,
    kpis,
    growthSeries,
    growthPoints,
    growthLine,
    growthArea,
    recentActivity,
    moderationTasks,
    highPriorityCount,
  };
}
