import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useAuth } from '../../../hooks/useAuth';
import { useResolvedTheme } from '../../../hooks/useResolvedTheme';
import {
  addAssistantMessage,
  addUserMessage,
  clearCurrentSession,
  closeChatbot,
  setTyping,
  startNewSession,
} from '../../../store/slices/chatbotSlice';

interface UseChatbotControllerParams {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function useChatbotController({ onNavigate, currentPath }: UseChatbotControllerParams) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDark } = useResolvedTheme();
  const chatbotState = useAppSelector((state) => state.chatbot);

  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = chatbotState?.isOpen ?? false;
  const currentSession = chatbotState?.currentSession ?? null;
  const isTyping = chatbotState?.isTyping ?? false;
  const quickActions = chatbotState?.quickActions ?? [];

  useEffect(() => {
    if (!chatbotState || !isOpen || currentSession || !user) {
      return;
    }

    dispatch(
      startNewSession({
        userId: user.id,
        userRole: user.role,
        currentPage: currentPath,
      }),
    );
  }, [chatbotState, currentPath, currentSession, dispatch, isOpen, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(focusTimer);
  }, [isOpen, currentSession?.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch(closeChatbot());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isOpen]);

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
      const { getChatbotResponseAsync } = await import('../../../lib/chatbotService');
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
        window.setTimeout(() => {
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) {
      return;
    }

    setDraft('');
    await sendMessage(message);
  };

  const close = () => dispatch(closeChatbot());
  const resetSession = () => dispatch(clearCurrentSession());

  return {
    available: Boolean(chatbotState),
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
  };
}

