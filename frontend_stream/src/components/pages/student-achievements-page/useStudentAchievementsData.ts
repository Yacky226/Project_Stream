import { Bolt, MessageSquare, Sparkles, WandSparkles } from 'lucide-react';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  calculateActivityStreak,
  useStudentSpaceData,
  type StudentSpaceData,
} from '../../student/StudentSpaceShared';
import type {
  LeaderboardEntry,
  MilestoneCard,
  SkillBadgeCard,
  TrophyCard,
} from './studentAchievements.types';
import { buildTrophyCards, LEADERBOARD_SEED, matchesQuery } from './studentAchievements.utils';

export interface StudentAchievementsDataModel {
  shared: StudentSpaceData;
  dashboard: StudentSpaceData['dashboard'];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  totalPoints: number;
  totalLearners: number;
  globalRank: number;
  topPercent: number;
  todayGain: number;
  visibleTrophyCards: TrophyCard[];
  visibleSkillBadges: SkillBadgeCard[];
  visibleMilestones: MilestoneCard[];
  visibleTopLeaderboard: LeaderboardEntry[];
  currentUserLeaderboard?: LeaderboardEntry;
  hasNoResult: boolean;
}

export function useStudentAchievementsData(): StudentAchievementsDataModel {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');

  const dashboard = shared.dashboard;
  const courses = dashboard?.courses ?? [];
  const recentActivity = dashboard?.recentActivity ?? [];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const streak = useMemo(
    () => calculateActivityStreak(recentActivity.map((activity) => activity.occurredAt)),
    [recentActivity],
  );

  const totalPoints = useMemo(() => {
    if (!dashboard) return 0;
    return Math.round(
      dashboard.stats.averageProgress * 100 +
        dashboard.stats.completedCourses * 2000 +
        dashboard.stats.activeCourses * 850 +
        streak * 180 +
        recentActivity.length * 90 +
        dashboard.stats.upcomingSessions * 350,
    );
  }, [dashboard, recentActivity.length, streak]);

  const totalLearners = 1200;
  const globalRank = Math.max(
    1,
    Math.min(totalLearners, Math.round(totalLearners / Math.max(totalPoints / 450, 1))),
  );
  const topPercent = Math.max(1, Math.round((globalRank / totalLearners) * 100));
  const todayGain = Math.max(25, Math.round(recentActivity.length * 30 + streak * 15));

  const trophyCards = useMemo(() => buildTrophyCards(courses), [courses]);

  const skillBadges = useMemo<SkillBadgeCard[]>(() => {
    if (!dashboard) return [];

    return [
      {
        id: 'quick-learner',
        title: 'Quick Learner',
        description: 'Mastered 5 skills in 48h',
        progress:
          dashboard.stats.completedCourses >= 1
            ? 100
            : Math.min(dashboard.stats.averageProgress, 100),
        statusLabel:
          dashboard.stats.completedCourses >= 1
            ? 'Unlocked'
            : `${dashboard.stats.averageProgress}% Complete`,
        icon: Bolt,
        accentClassName: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
        progressClassName: 'bg-blue-500',
        labelClassName:
          dashboard.stats.completedCourses >= 1 ? 'text-blue-600' : 'text-slate-400',
      },
      {
        id: 'discussion-pro',
        title: 'Discussion Pro',
        description: '10 top-voted answers',
        progress: Math.min((recentActivity.length / 10) * 100, 100),
        statusLabel:
          recentActivity.length >= 10
            ? 'Unlocked'
            : `${Math.round(Math.min((recentActivity.length / 10) * 100, 100))}% Complete`,
        icon: MessageSquare,
        accentClassName: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
        progressClassName: 'bg-green-500',
        labelClassName: recentActivity.length >= 10 ? 'text-green-600' : 'text-slate-400',
      },
      {
        id: 'quiz-master',
        title: 'Quiz Master',
        description: '3 perfect score streaks',
        progress: Math.min((dashboard.stats.averageProgress / 100) * 100, 100),
        statusLabel:
          dashboard.stats.averageProgress >= 100
            ? 'Unlocked'
            : `${Math.round(dashboard.stats.averageProgress)}% Complete`,
        icon: Sparkles,
        accentClassName: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
        progressClassName: 'bg-amber-500',
        labelClassName: dashboard.stats.averageProgress >= 100 ? 'text-amber-600' : 'text-slate-400',
      },
      {
        id: 'creative-spark',
        title: 'Creative Spark',
        description: 'First project published',
        progress: dashboard.stats.completedCourses >= 1 ? 100 : 0,
        statusLabel: dashboard.stats.completedCourses >= 1 ? 'Unlocked' : 'Locked',
        icon: WandSparkles,
        accentClassName: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300',
        progressClassName: 'bg-purple-500',
        labelClassName:
          dashboard.stats.completedCourses >= 1 ? 'text-purple-600' : 'text-slate-400',
      },
    ];
  }, [dashboard, recentActivity.length]);

  const milestoneCards = useMemo<MilestoneCard[]>(() => {
    if (!dashboard) return [];

    const xpGoal = totalPoints + 500;

    return [
      {
        id: 'pro-researcher',
        stage: 'In Progress',
        title: 'Pro Researcher Reward',
        description: `Earn ${Math.max(0, xpGoal - totalPoints)} more XP to unlock the exclusive library pass.`,
        progress: Math.min((totalPoints / xpGoal) * 100, 100),
      },
      {
        id: 'course-ambassador',
        stage: 'Locked',
        title: 'Course Ambassador Title',
        description:
          'Complete one more advanced or completed course to qualify for the ambassador title.',
      },
      {
        id: 'scholarship-opportunity',
        stage: 'Future',
        title: 'Scholarship Opportunity',
        description: `Maintain top ${Math.max(5, topPercent)}% rank for 3 consecutive months.`,
      },
    ];
  }, [dashboard, topPercent, totalPoints]);

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const currentUserName = shared.displayName || 'Student';
    return [
      ...LEADERBOARD_SEED,
      {
        rank: globalRank,
        name: `${currentUserName} (You)`,
        xp: totalPoints,
        avatar: shared.avatarUrl || '',
        highlighted: true,
      },
    ];
  }, [globalRank, shared.avatarUrl, shared.displayName, totalPoints]);

  const visibleTrophyCards = useMemo(
    () =>
      trophyCards.filter((card) =>
        matchesQuery(normalizedQuery, card.title, card.tag, card.issuer, card.dateLabel),
      ),
    [normalizedQuery, trophyCards],
  );

  const visibleSkillBadges = useMemo(
    () =>
      skillBadges.filter((badge) =>
        matchesQuery(normalizedQuery, badge.title, badge.description, badge.statusLabel),
      ),
    [normalizedQuery, skillBadges],
  );

  const visibleMilestones = useMemo(
    () =>
      milestoneCards.filter((milestone) =>
        matchesQuery(normalizedQuery, milestone.title, milestone.description, milestone.stage),
      ),
    [milestoneCards, normalizedQuery],
  );

  const visibleTopLeaderboard = useMemo(
    () =>
      leaderboard
        .filter((entry) => !entry.highlighted)
        .filter((entry) => matchesQuery(normalizedQuery, entry.name, entry.rank, entry.xp))
        .slice(0, 3),
    [leaderboard, normalizedQuery],
  );

  const currentUserLeaderboard = useMemo(
    () => leaderboard.find((entry) => entry.highlighted),
    [leaderboard],
  );

  const hasNoResult =
    !visibleTrophyCards.length &&
    !visibleSkillBadges.length &&
    !visibleMilestones.length &&
    !visibleTopLeaderboard.length;

  return {
    shared,
    dashboard,
    searchQuery,
    setSearchQuery,
    totalPoints,
    totalLearners,
    globalRank,
    topPercent,
    todayGain,
    visibleTrophyCards,
    visibleSkillBadges,
    visibleMilestones,
    visibleTopLeaderboard,
    currentUserLeaderboard,
    hasNoResult,
  };
}
