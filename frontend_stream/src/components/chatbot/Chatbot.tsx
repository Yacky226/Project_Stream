import { createPortal } from 'react-dom';
import { useChatbotController } from './hooks/useChatbotController';
import { getChatbotThemeTokens } from './chatbotTheme';
import { ChatbotHeader } from './components/ChatbotHeader';
import { ChatbotMessages } from './components/ChatbotMessages';
import { ChatbotComposer } from './components/ChatbotComposer';

interface ChatbotProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function Chatbot({ onNavigate, currentPath }: ChatbotProps) {
  const {
    available,
    isDark,
    isOpen,
    isTyping,
    currentSession,
    draft,
    setDraft,
    inputRef,
    messagesEndRef,
    visibleQuickActions,
    handleSubmit,
    sendMessage,
    close,
    resetSession,
  } = useChatbotController({ onNavigate, currentPath });

  if (!available || !isOpen) {
    return null;
  }

  const tokens = getChatbotThemeTokens(isDark);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10020] flex items-end justify-end p-2 sm:p-5">
      <button
        type="button"
        aria-label="Close chatbot"
        onClick={close}
        className="pointer-events-auto absolute inset-0 bg-slate-950/10"
        tabIndex={-1}
      />
      <section
        className={`pointer-events-auto relative z-[1] flex w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[24px] border sm:w-[min(420px,calc(100vw-2.5rem))] ${tokens.panelClass}`}
        style={{
          height: 'min(620px, calc(100dvh - 7.25rem))',
          maxHeight: 'calc(100dvh - 7.25rem)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <ChatbotHeader
          isDark={isDark}
          headerClass={tokens.headerClass}
          mutedTextClass={tokens.mutedTextClass}
          ghostButtonClass={tokens.ghostButtonClass}
          onNewSession={resetSession}
          onClose={close}
        />

        <ChatbotMessages
          currentSession={currentSession}
          isTyping={isTyping}
          isDark={isDark}
          messageAreaClass={tokens.messageAreaClass}
          mutedTextClass={tokens.mutedTextClass}
          assistantBubbleClass={tokens.assistantBubbleClass}
          userBubbleClass={tokens.userBubbleClass}
          typedDotsClass={tokens.typedDotsClass}
          quickActionClass={tokens.quickActionClass}
          visibleQuickActions={visibleQuickActions}
          onQuickAction={(label) => {
            void sendMessage(label);
          }}
          messagesEndRef={messagesEndRef}
        />

        <ChatbotComposer
          isDark={isDark}
          composerClass={tokens.composerClass}
          draft={draft}
          setDraft={setDraft}
          isTyping={isTyping}
          inputRef={inputRef}
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        />
      </section>
    </div>,
    document.body,
  );
}
