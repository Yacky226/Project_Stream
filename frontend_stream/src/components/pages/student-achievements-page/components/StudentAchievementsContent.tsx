import type { StudentAchievementsDataModel } from '../useStudentAchievementsData';
import { AchievementsStats } from './AchievementsStats';
import { LeaderboardCard } from './LeaderboardCard';
import { MilestonesCard } from './MilestonesCard';
import { SkillBadgesSection } from './SkillBadgesSection';
import { TrophyCaseSection } from './TrophyCaseSection';

interface StudentAchievementsContentProps {
  model: StudentAchievementsDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentAchievementsContent({
  model,
  onNavigate,
}: StudentAchievementsContentProps) {
  return (
    <div className="student-achievements-page space-y-8">
      <div className="student-achievements-layout grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-8">
          <AchievementsStats
            totalPoints={model.totalPoints}
            todayGain={model.todayGain}
            globalRank={model.globalRank}
            totalLearners={model.totalLearners}
            topPercent={model.topPercent}
          />

          <TrophyCaseSection cards={model.visibleTrophyCards} onNavigate={onNavigate} />
          <SkillBadgesSection badges={model.visibleSkillBadges} />
        </div>

        <aside className="min-w-0 space-y-8 lg:col-span-4">
          <LeaderboardCard
            entries={model.visibleTopLeaderboard}
            currentUser={model.currentUserLeaderboard}
            avatarUrl={model.shared.avatarUrl}
            initials={model.shared.initials}
            onNavigate={onNavigate}
          />
          <MilestonesCard milestones={model.visibleMilestones} />
        </aside>
      </div>

      {model.hasNoResult ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No element matches your search in achievements.
        </div>
      ) : null}
    </div>
  );
}
