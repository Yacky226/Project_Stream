import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { toggleChatbot } from '../../store/slices/chatbotSlice';
import { Bot, X } from 'lucide-react';

export function ChatButton() {
  const dispatch = useAppDispatch();
  const chatbotState = useAppSelector((state) => state.chatbot);
  const { isDark } = useResolvedTheme();

  if (!chatbotState) {
    return null;
  }

  const { isOpen, currentSession } = chatbotState;
  const messageCount = currentSession?.messages.length || 0;

  const handleToggle = () => {
    dispatch(toggleChatbot());
  };

  return (
    <div className="group fixed bottom-4 right-4 z-[9999] sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6">
      {!isOpen && !currentSession ? (
        <div className="pointer-events-none absolute bottom-full right-0 mb-3 opacity-0 transition-opacity group-hover:opacity-100">
          <div
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] shadow-xl ${
              isDark ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white'
            }`}
          >
            Chat with EduAI
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1152d4] to-indigo-600 text-white shadow-[0_16px_36px_-14px_rgba(17,82,212,0.75)] transition-all duration-300 hover:scale-105 hover:shadow-[0_22px_44px_-14px_rgba(17,82,212,0.8)] lg:h-16 lg:w-16"
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/25" />
        <span className="absolute inset-0 rounded-2xl ring-1 ring-white/25" />
        {isOpen ? <X className="relative z-10 h-6 w-6" /> : <Bot className="relative z-10 h-6 w-6" />}
        {!isOpen ? <span className="absolute inset-0 animate-ping rounded-2xl border-2 border-white/25 opacity-30" /> : null}
        {!isOpen && messageCount > 1 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {Math.min(messageCount, 9)}
          </span>
        ) : null}
      </button>
    </div>
  );
}
