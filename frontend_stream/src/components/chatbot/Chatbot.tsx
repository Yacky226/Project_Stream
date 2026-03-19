import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import {
  addAssistantMessage,
  addUserMessage,
  clearCurrentSession,
  closeChatbot,
  setTyping,
  startNewSession,
} from '../../store/slices/chatbotSlice';
import { getChatbotResponseAsync } from '../../lib/chatbotService';
import { Bot, Mic, Paperclip, Send, Smile, X } from 'lucide-react';

interface ChatbotProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function Chatbot({ onNavigate, currentPath }: ChatbotProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDark } = useResolvedTheme();
  const chatbotState = useAppSelector((state) => state.chatbot);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!chatbotState) {
    return null;
  }

  const { isOpen, currentSession, isTyping, quickActions } = chatbotState;

  useEffect(() => {
    if (!isOpen || currentSession || !user) {
      return;
    }

    dispatch(
      startNewSession({
        userId: user.id,
        userRole: user.role,
        currentPage: currentPath,
      }),
    );
  }, [currentPath, currentSession, dispatch, isOpen, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isTyping]);

  const visibleQuickActions = useMemo(() => {
    return quickActions
      .filter((item) => !item.roles || item.roles.includes(user?.role || 'student'))
      .slice(0, 3)
      .map((item) => item.label);
  }, [quickActions, user?.role]);

  const sendMessage = async (content: string) => {
    const message = content.trim();
    if (!message || !currentSession || !user) {
      return;
    }

    dispatch(addUserMessage(message));
    dispatch(setTyping(true));

    try {
      const response = await getChatbotResponseAsync(message, {
        userRole: user.role,
        currentPage: currentPath,
        userName: user.firstName,
      });

      dispatch(addAssistantMessage(response.message));

      if (response.action && onNavigate && response.action.type === 'navigate') {
        setTimeout(() => {
          onNavigate(response.action!.payload);
        }, 800);
      }
    } catch {
      dispatch(addAssistantMessage('I had a temporary issue. Please try again.'));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) {
      return;
    }
    setDraft('');
    await sendMessage(message);
  };

  const restartSession = () => {
    if (!user) return;
    dispatch(clearCurrentSession());
    dispatch(
      startNewSession({
        userId: user.id,
        userRole: user.role,
        currentPage: currentPath,
      }),
    );
  };

  if (!isOpen) {
    return null;
  }

  const panelClass = isDark
    ? 'border-[#203049] bg-[#0f172a] text-[#e2e8f0]'
    : 'border-[#dbe6ff] bg-white text-[#0f172a]';
  const headerClass = isDark
    ? 'border-[#203049] bg-[#0f172a]/92'
    : 'border-[#dbe6ff] bg-white/92';
  const mutedTextClass = isDark ? 'text-[#94a3b8]' : 'text-slate-500';
  const assistantBubbleClass = isDark
    ? 'rounded-tl-none bg-[#162033] text-[#e2e8f0]'
    : 'rounded-tl-none bg-slate-100 text-slate-800';
  const composerWrapClass = isDark
    ? 'border-[#203049] bg-[#0f172a]/92'
    : 'border-[#dbe6ff] bg-white/90';
  const composerClass = isDark
    ? 'border-[#334155] bg-[#162033]'
    : 'border-slate-200 bg-slate-100';

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-[9998] h-[min(680px,calc(100vh-6.75rem))] overflow-hidden rounded-[28px] border shadow-2xl shadow-[#0b1120]/20 sm:left-auto sm:right-5 sm:w-[380px] md:bottom-24 md:right-6 md:w-[400px] lg:right-6 ${panelClass}`}
    >
      <div className={`flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl ${headerClass}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4]">
              <Bot className="h-6 w-6" />
            </div>
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 bg-green-500 ${
                isDark ? 'border-[#0f172a]' : 'border-white'
              }`}
            />
          </div>
          <div>
            <h3 className="leading-none">EduAI Assistant</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${mutedTextClass}`}>
                Live & Ready
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dispatch(closeChatbot())}
          className={`transition-colors ${isDark ? 'text-[#94a3b8] hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="h-[calc(100%-156px)] overflow-y-auto p-5">
        {!currentSession ? null : (
          <div className="space-y-6">
            {currentSession.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <p
                    className={`text-xs uppercase tracking-widest ${
                      isUser ? 'mr-1 text-[#1152d4]/60' : `ml-1 ${mutedTextClass}`
                    }`}
                  >
                    {isUser ? 'You' : 'EduAI'}
                  </p>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'rounded-tr-none bg-[#1152d4] text-white shadow-[#1152d4]/20'
                        : assistantBubbleClass
                    }`}
                  >
                    {message.content}
                  </div>
                  <span
                    className={`text-[10px] ${
                      isUser ? 'mr-1 text-[#1152d4]/50' : `ml-1 ${mutedTextClass}`
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              );
            })}

            {isTyping ? (
              <div className="flex flex-col items-start gap-1.5">
                <p className={`ml-1 text-xs uppercase tracking-widest ${mutedTextClass}`}>EduAI</p>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${assistantBubbleClass}`}>
                  Typing...
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              {visibleQuickActions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendMessage(label)}
                  className="rounded-full border border-[#1152d4]/20 bg-[#1152d4]/5 px-4 py-2 text-xs font-medium text-[#1152d4] transition-all hover:bg-[#1152d4] hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={`border-t p-4 backdrop-blur-md ${composerWrapClass}`}>
        <form onSubmit={onSubmit} className={`rounded-2xl border p-1.5 ${composerClass}`}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={restartSession} className={`p-2 transition-colors hover:text-[#1152d4] ${mutedTextClass}`}>
              <Mic className="h-4 w-4" />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className={`flex-1 border-none bg-transparent py-2 text-sm outline-none ${isDark ? 'text-[#e2e8f0] placeholder:text-[#7f8ea3]' : 'text-slate-700 placeholder:text-slate-400'}`}
              placeholder="Ask anything..."
              type="text"
            />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/30 transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        <div className="mt-3 flex items-center justify-between px-1">
          <div className={`flex gap-3 ${mutedTextClass}`}>
            <Smile className="h-4 w-4" />
            <Paperclip className="h-4 w-4" />
            <Bot className="h-4 w-4" />
          </div>
          <span className={`text-[10px] uppercase tracking-[0.2em] ${mutedTextClass}`}>Enter to send</span>
        </div>
      </div>
    </div>
  );
}
