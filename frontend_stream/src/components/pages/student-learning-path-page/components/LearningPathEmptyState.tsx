import { Route } from 'lucide-react';

interface LearningPathEmptyStateProps {
  onNavigate: (path: string | number) => void;
}

export function LearningPathEmptyState({ onNavigate }: LearningPathEmptyStateProps) {
  return (
    <div className="student-learning-path-empty rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
        <Route className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">No learning path found</h1>
      <p className="mt-4 text-sm leading-7 text-slate-500">
        Try another search or open your enrolled courses to keep building your roadmap.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate('/student/courses')}
          className="rounded-2xl bg-[#1152d4] px-6 py-3 text-sm font-bold text-white hover:bg-[#0f47b9]"
        >
          Open My Courses
        </button>
        <button
          type="button"
          onClick={() => onNavigate('/catalog')}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          Browse Catalog
        </button>
      </div>
    </div>
  );
}
