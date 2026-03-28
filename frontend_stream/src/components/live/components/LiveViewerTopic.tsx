import { BookOpen, ChevronDown, Download } from 'lucide-react';

interface LiveViewerTopicCardProps {
  title: string;
  description: string;
  onOpenResources: () => void;
}

export function SessionFooterPeek() {
  return (
    <div className="mt-3 flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      <span className="mr-1 text-xs">
        <ChevronDown className="inline h-3.5 w-3.5 rotate-180" />
      </span>
      Session handouts & more
    </div>
  );
}

export function LiveViewerTopicCard({
  title,
  description,
  onOpenResources,
}: LiveViewerTopicCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1152d4]/10 text-[#1152d4]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1152d4]">
              Current Topic
            </p>
            <p className="truncate text-base font-bold text-slate-900">{title}</p>
            <p className="truncate text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenResources}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <Download className="h-4 w-4" />
            Resources
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
