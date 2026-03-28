import {
  ChevronUp,
  Clock3,
  Wifi,
} from "lucide-react";
import { formatTimeLabel } from "../liveSession.utils";

interface LiveSessionFooterProps {
  scheduledAt: string | null | undefined;
}

export function LiveSessionFooter({ scheduledAt }: LiveSessionFooterProps) {
  return (
    <footer className="group relative flex h-10 cursor-pointer items-center justify-center border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover:text-[#1152d4]">
        <ChevronUp className="h-4 w-4" />
        Session Handouts and More
      </div>
      <div className="absolute right-8 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold uppercase text-slate-500">
            Connection: Stable
          </span>
        </div>
        <div className="hidden items-center gap-1 text-[10px] font-bold uppercase text-slate-500 md:flex">
          <Clock3 className="h-3.5 w-3.5" />
          {formatTimeLabel(scheduledAt || null)}
        </div>
        <div className="hidden items-center gap-1 text-[10px] font-bold uppercase text-slate-500 md:flex">
          <Wifi className="h-3.5 w-3.5" />
          HD
        </div>
      </div>
    </footer>
  );
}
