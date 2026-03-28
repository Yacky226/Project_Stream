import { ChevronUp, Trophy } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { LeaderboardEntry } from '../studentAchievements.types';
import { formatXp } from '../studentAchievements.utils';

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentUser?: LeaderboardEntry;
  avatarUrl: string | null;
  initials: string;
  onNavigate: (path: string | number) => void;
}

export function LeaderboardCard({
  entries,
  currentUser,
  avatarUrl,
  initials,
  onNavigate,
}: LeaderboardCardProps) {
  return (
    <div className="student-achievements-side-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-6 dark:border-slate-800">
        <h3 className="text-lg font-bold">Leaderboard</h3>
        <p className="text-xs text-slate-500">Weekly Top Learners</p>
      </div>
      <div className="p-2">
        {entries.length ? (
          entries.map((entry) => (
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
                <ImageWithFallback src={entry.avatar} alt={entry.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{entry.name}</p>
                <p className="text-[10px] text-slate-400">{formatXp(entry.xp)} XP</p>
              </div>
              {entry.rank === 1 ? <Trophy className="h-4 w-4 fill-current text-amber-500" /> : null}
            </div>
          ))
        ) : (
          <p className="px-3 py-2 text-sm text-slate-500">No leaderboard result for this search.</p>
        )}

        <div className="mx-4 my-2 h-px bg-slate-100 dark:bg-slate-800" />

        {currentUser ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#1152d4]/10 bg-[#1152d4]/5 p-3">
            <span className="w-6 text-sm font-bold text-[#1152d4]">{currentUser.rank}</span>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-[#1152d4]/30 bg-[#1152d4]/20">
              {avatarUrl ? (
                <ImageWithFallback src={avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1152d4]">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1152d4]">{currentUser.name}</p>
              <p className="text-[10px] text-[#1152d4]/60">{formatXp(currentUser.xp)} XP</p>
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
  );
}
