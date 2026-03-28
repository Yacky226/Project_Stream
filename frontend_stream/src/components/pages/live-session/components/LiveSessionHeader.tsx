import { Compass, LogOut, Users } from "lucide-react";

interface LiveSessionHeaderProps {
  sessionTitle: string;
  isLive: boolean;
  attendeeCount: number;
  onLeave: () => void;
}

export function LiveSessionHeader({
  sessionTitle,
  isLive,
  attendeeCount,
  onLeave,
}: LiveSessionHeaderProps) {
  return (
    <header className="z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/80 md:px-8">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-[#1152d4]/10 p-2.5">
          <Compass className="h-5 w-5 text-[#1152d4]" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight">{sessionTitle}</h1>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-red-500" : "bg-slate-400"}`} />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {isLive ? "Live Q&A Session" : "Recorded Session"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800 md:flex">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {attendeeCount.toLocaleString("en-US")} attending
          </span>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-2 rounded-xl bg-[#1152d4] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9]"
        >
          <LogOut className="h-4 w-4" />
          Leave Session
        </button>
      </div>
    </header>
  );
}
