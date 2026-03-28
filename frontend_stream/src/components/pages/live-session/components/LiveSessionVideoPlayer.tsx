import {
  Maximize,
  MessageCircle,
  Pause,
  Play,
  Settings,
  User,
  Volume2,
} from "lucide-react";
import {
  formatPlayback,
  VIDEO_PLACEHOLDER,
} from "../liveSession.utils";

interface LiveSessionVideoPlayerProps {
  instructorName: string;
  progressPercent: number;
  elapsedMinutes: number;
  totalDurationMinutes: number;
}

export function LiveSessionVideoPlayer({
  instructorName,
  progressPercent,
  elapsedMinutes,
  totalDurationMinutes,
}: LiveSessionVideoPlayerProps) {
  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl dark:border-slate-800">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${VIDEO_PLACEHOLDER}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 scale-90 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-100">
          <Play className="h-9 w-9 fill-current" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex translate-y-4 flex-col gap-4 p-6 transition-transform duration-300 group-hover:translate-y-0">
        <div className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4 md:gap-6">
            <Pause className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
            <Volume2 className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
            <span className="text-sm font-medium tracking-tight">
              {formatPlayback(elapsedMinutes)} / {formatPlayback(totalDurationMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <MessageCircle className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
            <Settings className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
            <Maximize className="h-5 w-5 cursor-pointer transition-colors hover:text-[#1152d4]" />
          </div>
        </div>
      </div>

      <div className="absolute left-6 top-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/70 px-4 py-2 shadow-lg backdrop-blur-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1152d4] text-white">
          <User className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">{instructorName}</p>
          <p className="text-[10px] font-medium text-slate-500">Lead Designer</p>
        </div>
      </div>
    </div>
  );
}
