import { BookOpen, ChevronDown, Download } from "lucide-react";

interface LiveSessionTopicCardProps {
  topicTitle: string;
  onOpenResources: () => void;
}

export function LiveSessionTopicCard({
  topicTitle,
  onOpenResources,
}: LiveSessionTopicCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1152d4]/10">
          <BookOpen className="h-5 w-5 text-[#1152d4]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1152d4]">
            Current Topic
          </p>
          <h3 className="text-base font-bold">{topicTitle}</h3>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenResources}
          className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Download className="h-4 w-4" />
          Resources
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
