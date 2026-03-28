import { ChevronUp, Star, Trophy } from 'lucide-react';
import { formatXp } from '../studentAchievements.utils';

interface AchievementsStatsProps {
  totalPoints: number;
  todayGain: number;
  globalRank: number;
  totalLearners: number;
  topPercent: number;
}

export function AchievementsStats({
  totalPoints,
  todayGain,
  globalRank,
  totalLearners,
  topPercent,
}: AchievementsStatsProps) {
  return (
    <div className="student-achievements-stats-grid grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="student-achievements-stat-card flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Points</p>
          <h3 className="mt-1 text-3xl font-bold">
            {formatXp(totalPoints)} <span className="text-sm font-normal text-[#1152d4]">XP</span>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600">
            <ChevronUp className="h-4 w-4" />+{formatXp(todayGain)} today
          </p>
        </div>
        <div className="rounded-xl bg-[#1152d4]/10 p-4 text-[#1152d4]">
          <Star className="h-10 w-10 fill-current" />
        </div>
      </div>

      <div className="student-achievements-stat-card flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
  );
}
