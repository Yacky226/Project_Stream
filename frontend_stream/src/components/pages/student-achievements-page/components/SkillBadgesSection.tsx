import type { SkillBadgeCard } from '../studentAchievements.types';

interface SkillBadgesSectionProps {
  badges: SkillBadgeCard[];
}

export function SkillBadgesSection({ badges }: SkillBadgesSectionProps) {
  return (
    <section className="student-achievements-section">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Skill Badges</h2>

      {badges.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className="student-achievements-badge-card flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${badge.accentClassName}`}
                >
                  <Icon className="h-8 w-8 fill-current" />
                </div>
                <h5 className="text-sm font-bold">{badge.title}</h5>
                <p className="mb-4 text-xs text-slate-500">{badge.description}</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full ${badge.progressClassName}`} style={{ width: `${badge.progress}%` }} />
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
  );
}
