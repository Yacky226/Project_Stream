import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Bolt, Flame, Star } from 'lucide-react';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import type {
  DashboardActivityItem,
  DashboardSessionItem,
  StudentDashboardCourse,
  StudentDashboardStats,
} from '../../../types/dashboard';
import { useResolvedTheme } from '../../../hooks/useResolvedTheme';
import {
  calculateActivityStreak,
  useStudentSpaceData,
} from '../../student/StudentSpaceShared';
import {
  matchesQuery,
  resolveRecommendedIcon,
  titleMatchesQuery,
  WEEK_LABELS,
} from './studentDashboard.utils';

interface ContinueCard {
  course: StudentDashboardCourse;
  coverImage?: string;
}

interface RecommendedCard {
  id: string;
  title: string;
  instructor: string;
  scheduledAt: string;
  iconType: ReturnType<typeof resolveRecommendedIcon>;
}

interface WeeklyBars {
  highlightedIndex: number;
  items: Array<{
    index: number;
    label: string;
    count: number;
    valueLabel: string;
    heightPercent: number;
  }>;
}

interface AchievementCard {
  title: string;
  description: string;
  unlocked: boolean;
  iconClass: string;
  icon: ReactNode;
}

export interface StudentDashboardDataModel {
  shared: ReturnType<typeof useStudentSpaceData>;
  ready: boolean;
  dashboard: ReturnType<typeof useStudentSpaceData>['dashboard'];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isDark: boolean;
  firstName: string;
  dashboardStats: StudentDashboardStats | undefined;
  streak: number;
  continueCards: ContinueCard[];
  recommendedCards: RecommendedCard[];
  upcomingSessions: DashboardSessionItem[];
  weeklyBars: WeeklyBars;
  weeklyGoalTarget: number;
  weeklyGoalCurrent: number;
  weeklyGoalPercent: number;
  ringRadius: number;
  ringCircumference: number;
  ringOffset: number;
  visibleAchievementCards: AchievementCard[];
  hasNoResult: boolean;
  surfaceClass: string;
  emptyStateClass: string;
}

export function useStudentDashboardData(): StudentDashboardDataModel {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQueryState] = useState('');
  const { isDark } = useResolvedTheme();

  const ready = shared.status === 'ready' && Boolean(shared.dashboard);
  const { data: catalogCourses = [] } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });

  const dashboard = shared.dashboard;
  const profile = shared.profile;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const firstName = profile?.firstName || shared.displayName.split(' ')[0] || 'Student';
  const dashboardCourses: StudentDashboardCourse[] = dashboard?.courses ?? [];
  const dashboardSessions: DashboardSessionItem[] = dashboard?.upcomingSessions ?? [];
  const recentActivity: DashboardActivityItem[] = dashboard?.recentActivity ?? [];
  const dashboardStats = dashboard?.stats;
  const streak = calculateActivityStreak(
    recentActivity.map((activity) => activity.occurredAt),
  );

  const catalogById = useMemo(
    () => new Map(catalogCourses.map((course) => [String(course.id), course])),
    [catalogCourses],
  );

  const continueCards = useMemo<ContinueCard[]>(() => {
    const source = dashboardCourses
      .filter((course) => course.status !== 'ABANDONNE')
      .filter((course) =>
        titleMatchesQuery(`${course.title} ${course.description} ${course.category}`, normalizedQuery),
      )
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2);

    return source.map((course) => {
      const detail = catalogById.get(String(course.id));
      return {
        course,
        coverImage: detail?.coverImage || undefined,
      };
    });
  }, [catalogById, dashboardCourses, normalizedQuery]);

  const enrolledCourseIds = useMemo(
    () => new Set(dashboardCourses.map((course) => String(course.id))),
    [dashboardCourses],
  );

  const recommendedCards = useMemo<RecommendedCard[]>(() => {
    return catalogCourses
      .filter((course) => !enrolledCourseIds.has(String(course.id)))
      .filter((course) =>
        titleMatchesQuery(`${course.title} ${course.description} ${course.category}`, normalizedQuery),
      )
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 3)
      .map((course) => ({
        id: String(course.id),
        title: course.title,
        instructor: course.teacherId ? `Instructor #${course.teacherId}` : 'Course Mentor',
        scheduledAt: course.scheduledAt,
        iconType: resolveRecommendedIcon(course.category),
      }));
  }, [catalogCourses, enrolledCourseIds, normalizedQuery]);

  const upcomingSessions = useMemo(() => {
    return [...dashboardSessions]
      .filter((session) =>
        titleMatchesQuery(
          `${session.courseTitle} ${session.status} ${session.courseId}`,
          normalizedQuery,
        ),
      )
      .sort((a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime())
      .slice(0, 3);
  }, [dashboardSessions, normalizedQuery]);

  const weeklyBars = useMemo<WeeklyBars>(() => {
    const bars = WEEK_LABELS.map((label, index) => ({
      index,
      label,
      count: 0,
    }));

    recentActivity.forEach((activity) => {
      if (!activity.occurredAt) return;
      const date = new Date(activity.occurredAt);
      if (Number.isNaN(date.getTime())) return;
      const jsDay = date.getDay();
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
      bars[dayIndex].count += 1;
    });

    const maxCount = Math.max(...bars.map((day) => day.count), 1);
    const highlightedIndex = bars.reduce(
      (bestIndex, day, index, array) =>
        day.count > array[bestIndex].count ? index : bestIndex,
      0,
    );

    return {
      highlightedIndex,
      items: bars.map((day) => ({
        ...day,
        valueLabel: String(day.count),
        heightPercent: Math.max(20, Math.round((day.count / maxCount) * 90)),
      })),
    };
  }, [recentActivity]);

  const weeklyGoalTarget = Math.max(1, dashboardStats?.enrolledCourses ?? 1);
  const weeklyGoalCurrent = Math.min(
    dashboardStats?.completedCourses ?? 0,
    weeklyGoalTarget,
  );
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((weeklyGoalCurrent / weeklyGoalTarget) * 100),
  );
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - weeklyGoalPercent / 100);

  const achievementCards: AchievementCard[] = [
    {
      title: 'Fast Learner',
      description: 'Keep your daily learning velocity high.',
      unlocked: (dashboardStats?.averageProgress ?? 0) >= 65,
      iconClass: isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-600',
      icon: <Flame className="h-7 w-7" />,
    },
    {
      title: '10 Day Streak',
      description: 'Maintain consistent progress for 10 days.',
      unlocked: streak >= 10,
      iconClass: isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600',
      icon: <Star className="h-7 w-7 fill-current" />,
    },
    {
      title: 'Quiz Master',
      description: 'Reach perfect completion in advanced modules.',
      unlocked: (dashboardStats?.completedCourses ?? 0) >= 3,
      iconClass: isDark ? 'bg-[#334155] text-[#cbd5e1]' : 'bg-[#e2e8f0] text-[#475569]',
      icon: <Bolt className="h-7 w-7" />,
    },
  ];
  const visibleAchievementCards = achievementCards.filter((achievement) =>
    matchesQuery(normalizedQuery, achievement.title, achievement.description),
  );
  const hasNoResult =
    !continueCards.length &&
    !recommendedCards.length &&
    !upcomingSessions.length &&
    !visibleAchievementCards.length;
  const surfaceClass = isDark
    ? 'border-[#1e293b] bg-[#0f172a]'
    : 'border-[#1152d4]/5 bg-white';
  const emptyStateClass = isDark
    ? 'border-[#334155] bg-[#0f172a] text-[#cbd5e1]'
    : 'border-[#cbd5e1] bg-white text-[#64748b]';

  return {
    shared,
    ready,
    dashboard,
    searchQuery,
    setSearchQuery: setSearchQueryState,
    isDark,
    firstName,
    dashboardStats,
    streak,
    continueCards,
    recommendedCards,
    upcomingSessions,
    weeklyBars,
    weeklyGoalTarget,
    weeklyGoalCurrent,
    weeklyGoalPercent,
    ringRadius,
    ringCircumference,
    ringOffset,
    visibleAchievementCards,
    hasNoResult,
    surfaceClass,
    emptyStateClass,
  };
}
