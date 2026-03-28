import type { RefObject } from 'react';
import { Sparkles } from 'lucide-react';
import type { ChatSession } from '../../../types/chatbot';
import { formatMessageTime } from '../chatbot.utils';
import { renderMessageContent } from '../chatbotMessageRenderer';

interface ChatbotMessagesProps {
  currentSession: ChatSession | null;
  isTyping: boolean;
  isDark: boolean;
  messageAreaClass: string;
  mutedTextClass: string;
  assistantBubbleClass: string;
  userBubbleClass: string;
  typedDotsClass: string;
  quickActionClass: string;
  visibleQuickActions: string[];
  onQuickAction: (label: string) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function ChatbotMessages({
  currentSession,
  isTyping,
  isDark,
  messageAreaClass,
  mutedTextClass,
  assistantBubbleClass,
  userBubbleClass,
  typedDotsClass,
  quickActionClass,
  visibleQuickActions,
  onQuickAction,
  messagesEndRef,
}: ChatbotMessagesProps) {
  return (
    <div className={`relative flex-1 overflow-y-auto p-4 sm:p-5 ${messageAreaClass}`}>
      {!currentSession ? null : (
        <div className="space-y-5">
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
                    {renderMessageContent(message.content, message.id, isDark, isUser)}
                  </div>
                  {!isUser ? (
                    <span className={`mt-1.5 block text-[10px] ${mutedTextClass}`}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                  ) : null}
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
                  onClick={() => onQuickAction(label)}
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
  );
}
