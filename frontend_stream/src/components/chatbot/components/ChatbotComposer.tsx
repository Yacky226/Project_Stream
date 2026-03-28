import type { FormEvent, RefObject } from 'react';
import { ChevronRight, Mic } from 'lucide-react';

interface ChatbotComposerProps {
  isDark: boolean;
  composerClass: string;
  draft: string;
  setDraft: (value: string) => void;
  isTyping: boolean;
  inputRef: RefObject<HTMLInputElement>;
  onSubmit: (event: FormEvent) => void;
}

export function ChatbotComposer({
  isDark,
  composerClass,
  draft,
  setDraft,
  isTyping,
  inputRef,
  onSubmit,
}: ChatbotComposerProps) {
  return (
    <div className={`relative border-t px-3 py-3.5 ${isDark ? 'border-slate-800 bg-slate-900/98' : 'border-slate-200 bg-white/98'}`}>
      <form
        onSubmit={onSubmit}
        className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition focus-within:ring-2 ${composerClass}`}
      >
        <button
          type="button"
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:text-blue-200' : 'text-slate-400 hover:text-[#1152d4]'
          }`}
          aria-label="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={`flex-1 border-none bg-transparent py-2 text-[13px] outline-none ${isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
          placeholder="Ask anything..."
          type="text"
          autoFocus
        />
        <button
          type="submit"
          disabled={!draft.trim() || isTyping}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white shadow-[0_12px_24px_-14px_rgba(17,82,212,0.9)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
