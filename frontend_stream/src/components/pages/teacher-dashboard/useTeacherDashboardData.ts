import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ClipboardCheck,
  Clock3,
  Mail,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { useGetTeacherDashboardQuery } from '../../../store/api/dashboardApi';
import type {
  DashboardSessionItem,
  TeacherDashboardCourse,
} from '../../../types/dashboard';
import { useTeacherSpaceData } from '../../teacher/TeacherSpaceShared';
import {
  buildAreaPath,
  buildChartPoints,
  buildLinePath,
  downloadCsv,
  formatCompact,
  formatDateLabel,
  formatTimeLabel,
  minutesUntil,
} from './teacherDashboard.utils';

interface TeacherDashboardStatCard {
  title: string;
  value: string;
  badge: string;
  icon: LucideIcon;
  iconStyle: CSSProperties;
  badgeWrap: string;
}

interface TeacherDashboardQuickAction {
  label: string;
  badge: number;
  icon: LucideIcon;
  onClick: () => void;
}

interface TeacherDashboardPerformanceSeries {
  labels: string[];
  values: number[];
}

type NavigateFn = (path: string | number) => void;

export interface TeacherDashboardDataModel {
  shared: ReturnType<typeof useTeacherSpaceData>;
  data: ReturnType<typeof useGetTeacherDashboardQuery>['data'];
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  firstName: string;
  statCards: TeacherDashboardStatCard[];
  performanceSeries: TeacherDashboardPerformanceSeries;
  chartAreaPath: string;
  chartLinePath: string;
  quickActions: TeacherDashboardQuickAction[];
  nextSession: DashboardSessionItem | null;
  nextSessionLabel: string;
  filteredCourses: TeacherDashboardCourse[];
  topPerformingCourses: TeacherDashboardCourse[];
  handleExportReport: () => void;
}

export function useTeacherDashboardData(onNavigate: NavigateFn): TeacherDashboardDataModel {
  const shared = useTeacherSpaceData({ includeDashboard: false });
  const [searchQuery, setSearchQueryState] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useGetTeacherDashboardQuery(undefined, {
    skip: shared.status !== 'ready',
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allCourses: TeacherDashboardCourse[] = data?.courses ?? [];
  const upcomingSessions: DashboardSessionItem[] = data?.upcomingSessions ?? [];

  const filteredCourses = useMemo(() => {
    if (!normalizedQuery) return allCourses;
    return allCourses.filter((course) =>
      `${course.title} ${course.description} ${course.category}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allCourses, normalizedQuery]);

  const filteredUpcomingSessions = useMemo(() => {
    return [...upcomingSessions]
      .filter((session) =>
        `${session.courseTitle} ${session.status}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((left, right) => {
        const leftValue = new Date(left.startAt || '').getTime();
        const rightValue = new Date(right.startAt || '').getTime();
        return leftValue - rightValue;
      });
  }, [normalizedQuery, upcomingSessions]);

  const featuredCourses = useMemo(() => {
    return [...filteredCourses]
      .sort((left, right) => right.completionRate - left.completionRate)
      .slice(0, 4);
  }, [filteredCourses]);

  const topPerformingCourses = useMemo(() => {
    return [...filteredCourses]
      .sort((left, right) => right.completionRate - left.completionRate)
      .slice(0, 5);
  }, [filteredCourses]);

  const firstName = shared.profile?.firstName || shared.user?.firstName || 'Teacher';
  const totalStudents = data?.stats.totalStudents ?? 0;
  const totalCourses = data?.stats.totalCourses ?? 0;
  const activeEnrollments = data?.stats.activeEnrollments ?? 0;
  const averageCompletionRate = data?.stats.averageCompletionRate ?? 0;
  const liveSessions = data?.stats.liveSessions ?? 0;
  const upcomingSessionsCount = data?.stats.upcomingSessions ?? filteredUpcomingSessions.length;
  const nextSession = filteredUpcomingSessions[0] || null;
  const nextSessionMinutes = minutesUntil(nextSession?.startAt || null);
  const nextSessionLabel =
    nextSessionMinutes == null
      ? 'No session scheduled'
      : nextSessionMinutes <= 0
        ? 'Live now'
        : nextSessionMinutes < 60
          ? `Starts in ${nextSessionMinutes} mins`
          : `Starts in ${Math.floor(nextSessionMinutes / 60)}h ${nextSessionMinutes % 60}m`;

  const statCards: TeacherDashboardStatCard[] = [
    {
      title: 'Total Students',
      value: formatCompact(totalStudents),
      badge: `${formatCompact(totalCourses)} course(s)`,
      icon: Users,
      iconStyle: { backgroundColor: '#dbeafe', color: '#2563eb' },
      badgeWrap: 'bg-[#1152d4]/10 text-[#1152d4]',
    },
    {
      title: 'Active Enrollments',
      value: formatCompact(activeEnrollments),
      badge: `${formatCompact(upcomingSessionsCount)} upcoming`,
      icon: TrendingUp,
      iconStyle: { backgroundColor: '#dcfce7', color: '#16a34a' },
      badgeWrap: 'bg-green-100 text-green-700',
    },
    {
      title: 'Average Completion',
      value: `${Math.round(averageCompletionRate)}%`,
      badge: liveSessions > 0 ? `${liveSessions} live now` : 'No live right now',
      icon: ClipboardCheck,
      iconStyle: { backgroundColor: '#fef3c7', color: '#d97706' },
      badgeWrap: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Live Sessions',
      value: formatCompact(liveSessions),
      badge: `${formatCompact(upcomingSessionsCount)} scheduled`,
      icon: Video,
      iconStyle: { backgroundColor: '#ede9fe', color: '#7c3aed' },
      badgeWrap: 'bg-slate-100 text-slate-500',
    },
  ];

  const performanceSeries = useMemo(() => {
    const rankedCourses = [...filteredCourses]
      .sort((left, right) => right.completionRate - left.completionRate)
      .slice(0, 7);

    if (rankedCourses.length === 0) {
      return {
        labels: ['N/A'],
        values: [0],
      };
    }

    return {
      labels: rankedCourses.map((course, index) => {
        const compactTitle = course.title.trim();
        if (compactTitle.length <= 10) {
          return compactTitle.toUpperCase();
        }
        return `C${index + 1}`;
      }),
      values: rankedCourses.map((course) =>
        Math.max(0, Math.min(100, Number(course.completionRate.toFixed(1)))),
      ),
    };
  }, [filteredCourses]);

  const chartPoints = useMemo(
    () => buildChartPoints(performanceSeries.values, 720, 260),
    [performanceSeries.values],
  );
  const chartLinePath = useMemo(() => buildLinePath(chartPoints), [chartPoints]);
  const chartAreaPath = useMemo(() => buildAreaPath(chartPoints, 260), [chartPoints]);

  const quickActions: TeacherDashboardQuickAction[] = [
    {
      label: 'Grade Assignments',
      badge: totalCourses,
      icon: ClipboardCheck,
      onClick: () => onNavigate('/teacher/course-builder'),
    },
    {
      label: 'Schedule Live Session',
      badge: upcomingSessionsCount,
      icon: Video,
      onClick: () => onNavigate('/teacher/live-session-builder'),
    },
    {
      label: 'Message Students',
      badge: shared.unreadCount,
      icon: Mail,
      onClick: () => onNavigate('/notifications'),
    },
  ];

  const handleExportReport = () => {
    downloadCsv('teacher-dashboard-report.csv', [
      ['Metric', 'Value'],
      ['Teacher', shared.displayName],
      ['Role', shared.displayRole],
      ['Total students', String(totalStudents)],
      ['Active enrollments', String(activeEnrollments)],
      ['Average completion rate', `${Math.round(averageCompletionRate)}%`],
      ['Active courses', String(totalCourses)],
      ['Upcoming sessions', String(upcomingSessionsCount)],
      ['Live sessions', String(liveSessions)],
      [''],
      ['Top courses'],
      ['Title', 'Category', 'Enrollments', 'Completion rate', 'Next session'],
      ...featuredCourses.map((course) => [
        course.title,
        course.category,
        String(course.enrollments),
        `${Math.round(course.completionRate)}%`,
        formatDateLabel(course.nextSessionAt),
      ]),
      [''],
      ['Upcoming sessions'],
      ['Course', 'Date', 'Time', 'Status'],
      ...filteredUpcomingSessions.slice(0, 5).map((session) => [
        session.courseTitle,
        formatDateLabel(session.startAt),
        formatTimeLabel(session.startAt),
        session.status,
      ]),
    ]);
  };

  return {
    shared,
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    searchQuery,
    setSearchQuery: setSearchQueryState,
    firstName,
    statCards,
    performanceSeries,
    chartAreaPath,
    chartLinePath,
    quickActions,
    nextSession,
    nextSessionLabel,
    filteredCourses,
    topPerformingCourses,
    handleExportReport,
  };
}
