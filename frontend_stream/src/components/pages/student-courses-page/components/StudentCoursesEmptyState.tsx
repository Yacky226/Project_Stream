interface StudentCoursesEmptyStateProps {
  title: string;
  description: string;
}

export function StudentCoursesEmptyState({ title, description }: StudentCoursesEmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}
