import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { toggleChatbot } from '../../store/slices/chatbotSlice';
import { Bot } from 'lucide-react';

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
    <div className="group fixed bottom-6 right-4 z-[9999] sm:bottom-7 sm:right-5 lg:bottom-8 lg:right-8">
      {!currentSession && !isOpen ? (
        <div className="pointer-events-none absolute bottom-full right-0 mb-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] shadow-xl ${
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
        className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-white shadow-[0_24px_48px_-20px_rgba(17,82,212,0.78)] transition-all duration-300 hover:scale-105 hover:shadow-[0_30px_54px_-20px_rgba(17,82,212,0.88)] ${
          isOpen ? 'bg-[#0f44b4]' : 'bg-[#1152d4]'
        }`}
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20" />
        <span className="absolute inset-0 rounded-full ring-1 ring-white/30" />
        {!isOpen ? <span className="pointer-events-none absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-25" /> : null}
        <Bot className="relative z-10 h-8 w-8 text-white" />
      </button>
    </div>
  );
}
