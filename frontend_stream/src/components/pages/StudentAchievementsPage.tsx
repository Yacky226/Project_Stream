import { useMemo, useState } from 'react';
import {
  Bolt,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Star,
  Trophy,
  WandSparkles,
} from 'lucide-react';
import type { StudentDashboardCourse } from '../../types/dashboard';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  StudentSpaceShell,
  StudentSpaceStatus,
  calculateActivityStreak,
  formatStudentDateShort,
  useStudentSpaceData,
} from '../student/StudentSpaceShared';

interface StudentAchievementsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

interface TrophyCard {
  id: string;
  tag: string;
  tagClassName: string;
  dateLabel: string;
  title: string;
  issuer: string;
  image: string;
}

interface SkillBadgeCard {
  id: string;
  title: string;
  description: string;
  progress: number;
  statusLabel: string;
  icon: typeof Bolt;
  accentClassName: string;
  progressClassName: string;
  labelClassName: string;
}

interface MilestoneCard {
  id: string;
  stage: 'In Progress' | 'Locked' | 'Future';
  title: string;
  description: string;
  progress?: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  highlighted?: boolean;
}

const LEADERBOARD_SEED = [
  {
    rank: 1,
    name: 'Sarah Jenkins',
    xp: 18200,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA4KOJhGTZWeRP00NtQGFcGUY1NHCOaDlJ0mi5sYwYuu080n8b9V5f50VIDgzIt7bXEyiM71BYFfI4hH9L3EkQtvbF7FoEcygQ-8e9EgJDqRXuiNNb_Ni8wLhd3ZTt4gjUEHFqSz7VbZtZ7JeT-q0irD6rPFwBKy3q1C-DTWCAizc4TMuAICMPME29HPXfbXkSDlTtwoBHusvLv4uu2W2-3BwifIJn57OZiCrHm73k7Lreo0YJp5w7jyUzSAGAqgd57kUIjDDWoHiY',
  },
  {
    rank: 2,
    name: 'David Chen',
    xp: 17450,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBNKHkgE3h0K-oZMcNxZ4CkSkhDZPwT-5HES4PZel3UAd_0mB3H2B2A0t5AOWPC_ODFbg8LNIc2Mto-kw4-4urdbIEGnqbob6EvlUKGEiff1cYv4WkRLTwg6tPFIHXdfhTbcw9s2D_HTX-fsjCa7UKtAn2yGrMuT-9ITFurAjmEtfhbINMf7IjbRLU5DAejlPWJSUP9oczkZMjSjp-e-tx2omHY1JgQ1fs7Z9lzw3T4iI3HqHMUmcPV9HPgvJle_nMFmytjsXP-30g',
  },
  {
    rank: 3,
    name: 'Elena Rodriguez',
    xp: 16900,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwczjmOCdKLeWWykPTFf4us3HPZlK29j-EEjv6p5sy4WeFgfVSbn_M1ofzIxNzhHzAM8dTd1SkasND1xnIH7UI2si3fxYmuWDkJWeItVJQX-wRCkDpXW9nskg2Y-VlkpU0vYgddx84-VJhIb3whENotn8gdvmiODbrLWFWoo-x68BaSy5wAv0Lu-dM0MsUtMWSUWzSlI6bwe5q2iN2m0w89BYi2ZREmJ3OcQf2HHCXan_-R9y_y_q9YcGbmX_IKIXxvVXqtGDfJQ',
  },
];

function formatXp(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function getAchievementImage(index: number) {
  const images = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCy5hsbVz8Uq11EyQqfirOw0tQUZGeIsryYdgnj67JFmWCcLDi5L2-iaiBDxoAmE4J8KDW4PqfSSQf-PyFnuIfuz1sAdw88jR4bXN1SiCg9ctOAogz9dmCXUulrK_4N--gvxn3rJXKfFJkOSVSfgrkUZtEGKTMAKEfRo2oTyykFewghqiO5tv5Ws3TCJzZa3huMADrtaOKGpXn__GYBtwCQsPpT5Gy38IxMb5rpcCnsGfqNlhqZDAsSxcS0uTbCqZz4aSyYv5XJc0I',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCCWP1QyAzG0uCqaKSmw0SCl_6SjPAj065ME7j7Iqd_VLjA0QvM3kveavoPHHbRdOjaKsU-foXp-5rItWU_OjDNPe1SYwDXIR5IDpuzGURSUJf5_02Huh6kDR-iuseLeU4lt1FhGqY1b3hdDmxSsLvMjcbM_wVg8bmoyAS_gBHudnc5x9Qw_F_BmPyWxG0jMUF4kGT7N7gFw0qHklgUGVlZvlQJo1FdIw3l-m8Kw-B0-l8WhFmFLynl31EHLMFjG5yw-y6Uc3GBxPA',
  ];
  return images[index % images.length];
}

function buildTrophyCards(courses: StudentDashboardCourse[]): TrophyCard[] {
  const completedCourses = courses.filter((course) => course.status === 'TERMINE');
  const source = completedCourses.length >= 2 ? completedCourses.slice(0, 2) : courses.slice(0, 2);

  return source.map((course, index) => ({
    id: course.id,
    tag: course.status === 'TERMINE' ? 'Course Complete' : 'Expert Status',
    tagClassName:
      index % 2 === 0
        ? 'bg-[#1152d4]/10 text-[#1152d4]'
        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300',
    dateLabel: formatStudentDateShort(course.enrolledAt || course.scheduledAt),
    title: course.title,
    issuer:
      course.status === 'TERMINE' ? 'Issued by Academic Board' : 'Academic Excellence Award',
    image: getAchievementImage(index),
  }));
}

function matchesQuery(query: string, ...values: Array<string | number>) {
  if (!query) return true;
  return values.join(' ').toLowerCase().includes(query);
}

export function StudentAchievementsPage({
  onNavigate,
  currentPath,
}: StudentAchievementsPageProps) {
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
        labelClassName: dashboard.stats.completedCourses >= 1 ? 'text-blue-600' : 'text-slate-400',
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
        labelClassName: dashboard.stats.completedCourses >= 1 ? 'text-purple-600' : 'text-slate-400',
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

  if (shared.status !== 'ready' || !dashboard) {
    return <StudentSpaceStatus shared={shared} />;
  }

  return (
    <StudentSpaceShell
      currentPath={currentPath}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search badges, trophies, milestones..."
      displayName={shared.displayName}
      displayLevel={shared.displayLevel}
      initials={shared.initials}
      avatarUrl={shared.avatarUrl}
      goalProgress={shared.goalProgress}
      unreadCount={shared.unreadCount}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Points</p>
                  <h3 className="mt-1 text-3xl font-bold">
                    {formatXp(totalPoints)}{' '}
                    <span className="text-sm font-normal text-[#1152d4]">XP</span>
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600">
                    <ChevronUp className="h-4 w-4" />+{formatXp(todayGain)} today
                  </p>
                </div>
                <div className="rounded-xl bg-[#1152d4]/10 p-4 text-[#1152d4]">
                  <Star className="h-10 w-10 fill-current" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Global Rank</p>
                  <h3 className="mt-1 text-3xl font-bold">
                    #{globalRank}{' '}
                    <span className="text-sm font-normal text-slate-400">/ {formatXp(totalLearners)}</span>
                  </h3>
                  <p className="mt-1 text-xs font-medium text-orange-500">Top {topPercent}% this month</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-4 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                  <Trophy className="h-10 w-10 fill-current" />
                </div>
              </div>
            </div>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Trophy Case</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('/profile/public')}
                  className="text-sm font-semibold text-[#1152d4] hover:underline"
                >
                  View All
                </button>
              </div>

              {visibleTrophyCards.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {visibleTrophyCards.map((card) => (
                    <div
                      key={card.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1152d4]/5 to-transparent" />
                        <ImageWithFallback
                          src={card.image}
                          alt={card.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="px-5 pb-5">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${card.tagClassName}`}
                          >
                            {card.tag}
                          </span>
                          <span className="text-xs italic text-slate-400">{card.dateLabel}</span>
                        </div>
                        <h4 className="mb-1 text-lg font-bold">{card.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{card.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  No trophy matches your current search.
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">Skill Badges</h2>

              {visibleSkillBadges.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {visibleSkillBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div
                          className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${badge.accentClassName}`}
                        >
                          <Icon className="h-8 w-8 fill-current" />
                        </div>
                        <h5 className="text-sm font-bold">{badge.title}</h5>
                        <p className="mb-4 text-xs text-slate-500">{badge.description}</p>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full ${badge.progressClassName}`}
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                        <span className={`mt-1 text-[10px] font-bold uppercase ${badge.labelClassName}`}>
                          {badge.statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  No badge matches your current search.
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                <h3 className="text-lg font-bold">Leaderboard</h3>
                <p className="text-xs text-slate-500">Weekly Top Learners</p>
              </div>
              <div className="p-2">
                {visibleTopLeaderboard.length ? (
                  visibleTopLeaderboard.map((entry) => (
                    <div
                      key={`${entry.rank}-${entry.name}`}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span
                        className={`w-6 text-sm font-bold ${
                          entry.rank === 1
                            ? 'text-amber-500'
                            : entry.rank === 2
                              ? 'text-slate-400'
                              : 'text-orange-400'
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                        <ImageWithFallback
                          src={entry.avatar}
                          alt={entry.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{entry.name}</p>
                        <p className="text-[10px] text-slate-400">{formatXp(entry.xp)} XP</p>
                      </div>
                      {entry.rank === 1 ? (
                        <Trophy className="h-4 w-4 fill-current text-amber-500" />
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500">No leaderboard result for this search.</p>
                )}

                <div className="mx-4 my-2 h-px bg-slate-100 dark:bg-slate-800" />

                {currentUserLeaderboard ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#1152d4]/10 bg-[#1152d4]/5 p-3">
                    <span className="w-6 text-sm font-bold text-[#1152d4]">{currentUserLeaderboard.rank}</span>
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-[#1152d4]/30 bg-[#1152d4]/20">
                      {shared.avatarUrl ? (
                        <ImageWithFallback
                          src={shared.avatarUrl}
                          alt={currentUserLeaderboard.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1152d4]">
                          {shared.initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1152d4]">{currentUserLeaderboard.name}</p>
                      <p className="text-[10px] text-[#1152d4]/60">{formatXp(currentUserLeaderboard.xp)} XP</p>
                    </div>
                    <ChevronUp className="h-4 w-4 text-[#1152d4]" />
                  </div>
                ) : null}
              </div>
              <div className="bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() => onNavigate('/student/community')}
                  className="text-xs font-bold text-[#1152d4] hover:underline"
                >
                  View Full Leaderboard
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-6 text-lg font-bold">Upcoming Milestones</h3>

              {visibleMilestones.length ? (
                <div className="relative space-y-6 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                  {visibleMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative pl-8">
                      <div
                        className={`absolute left-0 top-1.5 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                          index === 0
                            ? 'border-[#1152d4] bg-white dark:bg-slate-900'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        {index === 0 ? <div className="h-2 w-2 rounded-full bg-[#1152d4]" /> : null}
                      </div>
                      <p
                        className={`mb-1 text-xs font-bold uppercase ${
                          milestone.stage === 'In Progress' ? 'text-[#1152d4]' : 'text-slate-400'
                        }`}
                      >
                        {milestone.stage}
                      </p>
                      <h4
                        className={`text-sm font-bold ${
                          milestone.stage === 'In Progress'
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">{milestone.description}</p>
                      {typeof milestone.progress === 'number' ? (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-[#1152d4]" style={{ width: `${milestone.progress}%` }} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  No milestone matches your current search.
                </div>
              )}
            </div>
          </aside>
        </div>

        {hasNoResult ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No element matches your search in achievements.
          </div>
        ) : null}
      </div>
    </StudentSpaceShell>
  );
}
