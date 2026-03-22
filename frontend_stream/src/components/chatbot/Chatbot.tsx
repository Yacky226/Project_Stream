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
import { Bot, Paperclip, RefreshCcw, Send, Sparkles, X } from 'lucide-react';

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
    ? 'border-slate-700/80 bg-slate-950/95 text-slate-100 shadow-[0_30px_90px_-45px_rgba(2,6,23,0.95)]'
    : 'border-slate-200 bg-white/95 text-slate-900 shadow-[0_30px_90px_-45px_rgba(30,64,175,0.42)]';
  const overlayClass = isDark
    ? 'bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent'
    : 'bg-gradient-to-br from-blue-100 via-indigo-50 to-transparent';
  const headerClass = isDark ? 'border-slate-700/80 bg-slate-950/82' : 'border-slate-200 bg-white/84';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const assistantBubbleClass = isDark
    ? 'rounded-tl-md bg-slate-800/90 text-slate-100'
    : 'rounded-tl-md bg-slate-100 text-slate-800';
  const userBubbleClass = isDark
    ? 'rounded-tr-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_12px_28px_-18px_rgba(59,130,246,0.9)]'
    : 'rounded-tr-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_12px_28px_-18px_rgba(37,99,235,0.7)]';
  const composerWrapClass = isDark
    ? 'border-slate-700/80 bg-slate-950/85'
    : 'border-slate-200 bg-white/90';
  const composerClass = isDark
    ? 'border-slate-700 bg-slate-900'
    : 'border-slate-200 bg-slate-50';
  const typedDotsClass = isDark ? 'bg-slate-400/70' : 'bg-slate-500/60';
  const conversationCount = currentSession?.messages.length || 0;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-[9998] h-[min(700px,calc(100vh-6.75rem))] overflow-hidden rounded-[28px] border backdrop-blur-xl sm:left-auto sm:right-5 sm:w-[400px] md:bottom-24 md:right-6 md:w-[420px] lg:right-6 ${panelClass}`}
    >
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />

      <div className={`relative flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl ${headerClass}`}>
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500/25 to-indigo-500/25 text-blue-300'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-[#1152d4]'
              }`}
            >
              <Bot className="h-5 w-5" />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 bg-emerald-500 ${
                isDark ? 'border-slate-950' : 'border-white'
              }`}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none sm:text-base">EduAI Assistant</h3>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
              }`}>
                Online
              </span>
              <span className={`text-[11px] font-medium ${mutedTextClass}`}>
                {conversationCount} message{conversationCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={restartSession}
            className={`rounded-lg p-2 transition ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Restart conversation"
            aria-label="Restart conversation"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => dispatch(closeChatbot())}
            className={`rounded-lg p-2 transition ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-label="Close chatbot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative h-[calc(100%-182px)] overflow-y-auto px-5 py-4">
        {!currentSession ? null : (
          <div className="space-y-5">
            {currentSession.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[86%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`mb-1 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser ? (
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${
                            isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          isUser ? 'text-blue-500/70' : mutedTextClass
                        }`}
                      >
                        {isUser ? 'You' : 'EduAI'}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isUser ? userBubbleClass : assistantBubbleClass
                      }`}
                    >
                      {message.content}
                    </div>
                    <span
                      className={`mt-1 block text-[10px] ${
                        isUser ? 'text-right text-blue-500/60' : mutedTextClass
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="max-w-[86%]">
                  <div className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${mutedTextClass}`}>
                    EduAI
                  </div>
                  <div className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 ${assistantBubbleClass}`}>
                    <span className={`h-2 w-2 animate-bounce rounded-full ${typedDotsClass}`} />
                    <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:120ms] ${typedDotsClass}`} />
                    <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:240ms] ${typedDotsClass}`} />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-1">
              <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${mutedTextClass}`}>
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
              {visibleQuickActions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendMessage(label)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    isDark
                      ? 'border-blue-400/30 bg-blue-400/10 text-blue-200 hover:border-blue-300 hover:bg-blue-500 hover:text-white'
                      : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
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

      <div className={`relative border-t p-4 backdrop-blur-md ${composerWrapClass}`}>
        <form onSubmit={onSubmit} className={`rounded-2xl border p-1.5 ${composerClass}`}>
          <div className="flex items-center gap-3">
            <Paperclip className={`ml-2 h-4 w-4 ${mutedTextClass}`} />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className={`flex-1 border-none bg-transparent py-2 text-sm outline-none ${isDark ? 'text-[#e2e8f0] placeholder:text-[#7f8ea3]' : 'text-slate-700 placeholder:text-slate-400'}`}
              placeholder="Ask for help, navigation, or course insights..."
              type="text"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isTyping}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/30 transition-transform hover:scale-105 disabled:scale-100 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        <div className="mt-2 flex items-center justify-between px-1">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${mutedTextClass}`}>
            Enter to send
          </span>
          <span className={`text-[10px] ${mutedTextClass}`}>Powered by EduAI</span>
        </div>
      </div>
    </div>
  );
}
