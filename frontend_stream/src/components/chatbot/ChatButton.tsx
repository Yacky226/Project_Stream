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

  const handleToggle = () => {
    dispatch(toggleChatbot());
  };

  return (
    <div className="group fixed bottom-4 right-4 z-[9999] sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6">
      {!isOpen && !currentSession ? (
        <div className="pointer-events-none absolute bottom-full right-0 mb-3 opacity-0 transition-opacity group-hover:opacity-100">
          <div
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-xl ${
              isDark ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white'
            }`}
          >
            Need Help? Chat with EduAI
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1152d4] text-white shadow-xl shadow-[#1152d4]/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl lg:h-16 lg:w-16"
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20" />
        {isOpen ? <X className="relative z-10 h-7 w-7" /> : <Bot className="relative z-10 h-7 w-7" />}
        {!isOpen ? <span className="absolute inset-0 animate-ping rounded-full border-4 border-white/20 opacity-20" /> : null}
      </button>
    </div>
  );
}
