import { ArrowRight } from 'lucide-react';
import type { AdminDashboardDataModel } from '../useAdminDashboardData';

interface AdminModerationSectionProps {
  moderationTasks: AdminDashboardDataModel['moderationTasks'];
  highPriorityCount: AdminDashboardDataModel['highPriorityCount'];
  onNavigate: (path: string | number) => void;
}

export function AdminModerationSection({
  moderationTasks,
  highPriorityCount,
  onNavigate,
}: AdminModerationSectionProps) {
  return (
    <aside className="rounded-xl border border-[#1152d4]/10 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Moderation</h2>
        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-500 dark:bg-red-900/30 dark:text-red-300">
          {highPriorityCount} High Priority
        </span>
      </div>

      <div className="space-y-4">
        {moderationTasks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No moderation issues detected from the latest backend data.
          </p>
        ) : (
          moderationTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border p-4 ${
                task.severity === 'high'
                  ? 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20'
                  : 'border-[#1152d4]/10 bg-[#f6f6f8] dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-tight ${
                  task.severity === 'high' ? 'text-red-600 dark:text-red-300' : 'text-slate-500'
                }`}>
                  {task.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{task.time}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/support')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                    task.severity === 'high'
                      ? 'bg-red-600 text-white'
                      : 'bg-[#1152d4]/10 text-[#1152d4]'
                  }`}
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/courses')}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => onNavigate('/admin/support')}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#1152d4]/10 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#1152d4]/5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        See All Moderation Task
        <ArrowRight className="ml-2 h-4 w-4 text-[#1152d4]" />
      </button>
    </aside>
  );
}
