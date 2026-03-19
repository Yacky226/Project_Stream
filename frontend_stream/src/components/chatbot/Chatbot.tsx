import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
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

  return (
    <div className="fixed bottom-24 right-8 z-[9998] h-[600px] w-[400px] overflow-hidden rounded-xl border border-[#1152d4]/10 bg-white shadow-2xl dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-[#1152d4]/10 bg-white/80 px-5 py-4 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1152d4]/10 text-[#1152d4]">
              <Bot className="h-6 w-6" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
          </div>
          <div>
            <h3 className="leading-none text-slate-900 dark:text-white">EduAI Assistant</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live & Ready
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dispatch(closeChatbot())}
          className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="h-[calc(100%-150px)] overflow-y-auto p-5">
        {!currentSession ? null : (
          <div className="space-y-6">
            {currentSession.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <p
                    className={`text-xs uppercase tracking-widest ${
                      isUser ? 'mr-1 text-[#1152d4]/60' : 'ml-1 text-slate-400'
                    }`}
                  >
                    {isUser ? 'You' : 'EduAI'}
                  </p>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'rounded-tr-none bg-[#1152d4] text-white shadow-[#1152d4]/20'
                        : 'rounded-tl-none bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className={`text-[10px] ${isUser ? 'mr-1 text-[#1152d4]/50' : 'ml-1 text-slate-400'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              );
            })}

            {isTyping ? (
              <div className="flex flex-col items-start gap-1.5">
                <p className="ml-1 text-xs uppercase tracking-widest text-slate-400">EduAI</p>
                <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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

      <div className="border-t border-slate-100 bg-white/60 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <button type="button" onClick={restartSession} className="p-2 text-slate-500 transition-colors hover:text-[#1152d4]">
              <Mic className="h-4 w-4" />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="flex-1 border-none bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
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
          <div className="flex gap-3 text-slate-400">
            <Smile className="h-4 w-4" />
            <Paperclip className="h-4 w-4" />
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Enter to send</span>
        </div>
      </div>
    </div>
  );
}

