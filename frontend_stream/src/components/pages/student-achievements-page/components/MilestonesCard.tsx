import type { MilestoneCard as MilestoneItem } from '../studentAchievements.types';

interface MilestonesCardProps {
  milestones: MilestoneItem[];
}

export function MilestonesCard({ milestones }: MilestonesCardProps) {
  return (
    <div className="student-achievements-side-card rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-6 text-lg font-bold">Upcoming Milestones</h3>

      {milestones.length ? (
        <div className="relative space-y-6 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {milestones.map((milestone, index) => (
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
  );
}
