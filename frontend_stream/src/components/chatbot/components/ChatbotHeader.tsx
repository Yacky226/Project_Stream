import { Bot, RefreshCcw, X } from 'lucide-react';

interface ChatbotHeaderProps {
  isDark: boolean;
  headerClass: string;
  mutedTextClass: string;
  ghostButtonClass: string;
  onNewSession: () => void;
  onClose: () => void;
}

export function ChatbotHeader({
  isDark,
  headerClass,
  mutedTextClass,
  ghostButtonClass,
  onNewSession,
  onClose,
}: ChatbotHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b px-4 py-3.5 ${headerClass}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              isDark ? 'bg-[#1152d4]/18 text-blue-200' : 'bg-[#1152d4]/10 text-[#1152d4]'
            }`}
          >
            <Bot className="h-5 w-5" />
          </div>
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
              isDark ? 'border-slate-900 bg-emerald-400' : 'border-white bg-emerald-500'
            }`}
          />
        </div>
        <div>
          <h3 className="text-[18px] font-black leading-none tracking-tight">EduAI Assistant</h3>
          <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${mutedTextClass}`}>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live & Ready
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNewSession}
          className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition ${ghostButtonClass}`}
          aria-label="New chat session"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          New
        </button>
        <button
          type="button"
          onClick={onClose}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${ghostButtonClass}`}
          aria-label="Close chatbot"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
