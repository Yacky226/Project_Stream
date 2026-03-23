import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import {
  addAssistantMessage,
  addUserMessage,
  closeChatbot,
  setTyping,
  startNewSession,
} from '../../store/slices/chatbotSlice';
import { getChatbotResponseAsync } from '../../lib/chatbotService';
import { Bot, ChevronRight, Mic, Sparkles, X } from 'lucide-react';

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
    if (!isOpen) {
      return;
    }

    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY || window.pageYOffset;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehaviorY;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.touchAction = 'none';
    root.style.overflow = 'hidden';
    root.style.overscrollBehaviorY = 'none';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehaviorY = previousRootOverscroll;
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
    };
  }, [isOpen]);

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
        conversationHistory: currentSession.messages.map((item) => ({
          role: item.role,
          content: item.content,
        })),
      });

      dispatch(
        addAssistantMessage({
          content: response.message,
          source: response.source,
          provider: response.provider,
        }),
      );

      if (response.action && onNavigate && response.action.type === 'navigate') {
        setTimeout(() => {
          onNavigate(response.action!.payload);
        }, 800);
      }
    } catch {
      dispatch(
        addAssistantMessage({
          content: 'I had a temporary issue. Please try again.',
          source: 'fallback',
          provider: 'local',
        }),
      );
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

  if (!isOpen) {
    return null;
  }

  const panelClass = isDark
    ? 'border-[#1152d4]/20 bg-slate-900/95 text-slate-100 shadow-[0_30px_68px_-30px_rgba(2,8,23,0.95)]'
    : 'border-[#1152d4]/10 bg-white text-slate-900 shadow-[0_34px_72px_-32px_rgba(17,82,212,0.45)]';
  const headerClass = isDark
    ? 'border-[#1152d4]/20 bg-slate-900/72 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/66'
    : 'border-[#1152d4]/10 bg-white/82 backdrop-blur-xl supports-[backdrop-filter]:bg-white/76';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const assistantBubbleClass = isDark
    ? 'rounded-2xl rounded-tl-none bg-slate-800 text-slate-100'
    : 'rounded-2xl rounded-tl-none bg-slate-100 text-slate-700';
  const userBubbleClass = isDark
    ? 'rounded-2xl rounded-tr-none bg-[#1152d4] text-white shadow-[0_12px_26px_-14px_rgba(17,82,212,0.9)]'
    : 'rounded-2xl rounded-tr-none bg-[#1152d4] text-white shadow-[0_12px_26px_-14px_rgba(17,82,212,0.72)]';
  const composerClass = isDark
    ? 'bg-slate-800/55 border-transparent focus-within:ring-[#1152d4]/35'
    : 'bg-slate-50 border-transparent focus-within:ring-[#1152d4]/26';
  const typedDotsClass = isDark ? 'bg-slate-300/80' : 'bg-slate-500/60';
  const quickActionClass = isDark
    ? 'border-[#1152d4]/35 bg-[#1152d4]/15 text-blue-100 hover:bg-[#1152d4] hover:text-white'
    : 'border-[#1152d4]/20 bg-[#1152d4]/5 text-[#1152d4] hover:bg-[#1152d4] hover:text-white';

  return (
    <div className="fixed inset-0 z-[9998]">
      <button
        type="button"
        aria-label="Close chatbot"
        onClick={() => dispatch(closeChatbot())}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-900/26 backdrop-blur-[2px]"
      />

      <div
        className={`absolute bottom-20 right-2 h-[min(600px,calc(100vh-6.25rem))] w-[min(400px,calc(100vw-1rem))] overflow-hidden rounded-2xl border sm:right-5 md:bottom-24 md:right-6 ${panelClass}`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${headerClass}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
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
          <button
            type="button"
            onClick={() => dispatch(closeChatbot())}
            className={`rounded-full p-1.5 transition ${
              isDark ? 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
            }`}
            aria-label="Close chatbot"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative h-[calc(100%-172px)] overflow-y-auto p-5">
          {!currentSession ? null : (
            <div className="space-y-6">
              {currentSession.messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[84%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`mb-1.5 flex items-center gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser ? (
                          <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-md ${
                              isDark ? 'bg-[#1152d4]/25 text-blue-200' : 'bg-[#1152d4]/10 text-[#1152d4]'
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                          </span>
                        ) : null}
                        <span
                        className={`text-[10px] font-bold uppercase tracking-[0.17em] ${
                            isUser ? 'text-[#1152d4]/70' : mutedTextClass
                          }`}
                        >
                          {isUser ? 'You' : 'EduAI'}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                          isUser ? userBubbleClass : assistantBubbleClass
                        }`}
                      >
                        {message.content}
                      </div>
                      {!isUser ? <span className={`mt-1.5 block text-[10px] ${mutedTextClass}`}>{formatTime(message.timestamp)}</span> : null}
                    </div>
                  </div>
                );
              })}

              {isTyping ? (
                <div className="flex justify-start">
                  <div className="max-w-[84%]">
                    <div className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${mutedTextClass}`}>
                      EduAI
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-4 py-2.5 ${assistantBubbleClass}`}>
                      <span className={`h-2 w-2 animate-bounce rounded-full ${typedDotsClass}`} />
                      <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:120ms] ${typedDotsClass}`} />
                      <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:240ms] ${typedDotsClass}`} />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="pt-1">
                <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ${mutedTextClass}`}>
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleQuickActions.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => sendMessage(label)}
                      className={`rounded-full border px-4 py-2 text-[11px] font-semibold transition-all duration-200 ${quickActionClass}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className={`relative border-t px-4 py-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
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
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className={`flex-1 border-none bg-transparent py-2 text-[13px] outline-none ${isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
              placeholder="Ask anything..."
              type="text"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isTyping}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white shadow-[0_12px_24px_-14px_rgba(17,82,212,0.9)] transition hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
          <p className={`mt-3 text-center text-[9px] font-bold uppercase tracking-[0.18em] ${mutedTextClass}`}>
            Powered by Lexend Academic Engine
          </p>
        </div>
      </div>
    </div>
  );
}
