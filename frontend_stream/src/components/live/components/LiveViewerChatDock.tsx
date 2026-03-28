import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AtSign, BookOpen, Hand, Loader2, MessageSquare, Paperclip, PlusCircle, Send, Smile } from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';
import { normalizeUserRole } from '../../../lib/roleUtils';
import {
  useGetChatHistoryQuery,
  useGetHandRaiseQueueQuery,
  useLowerHandMutation,
  useRaiseHandMutation,
  useSendChatMessageMutation,
} from '../../../store/api/liveApi';
import {
  mapLiveChatMessage,
  mapLiveHandRaise,
  type BackendLiveChatMessageDTO,
  type BackendLiveHandRaiseDTO,
  type LiveChatMessage,
  type LiveHandRaise,
} from '../../../types/live';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { LIVE_CHAT_POLLING_MS, LIVE_HAND_RAISE_POLLING_MS } from '../liveConstants';
import { getErrorMessage } from '../liveModule.utils';
import {
  mergeHandRaiseQueueFromEvent,
  mergeLiveMessage,
  sortHandRaiseQueue,
  sortLiveMessages,
  useLiveRealtimeSocket,
} from '../liveRealtimeSocket';
import { formatMessageClock, initialsFromName } from '../liveViewerChat.utils';

interface LiveViewerChatDockProps {
  sessionId: string;
  userId: string | null;
  className?: string;
}

export function LiveViewerChatDock({ sessionId, userId, className }: LiveViewerChatDockProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const viewerRole = normalizeUserRole(authUser?.role);
  const isStudentViewer = viewerRole === 'student';
  const { data: messagesData = [], isFetching } = useGetChatHistoryQuery(sessionId || '', {
    skip: !sessionId,
    pollingInterval: sessionId ? LIVE_CHAT_POLLING_MS : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: handQueueData = [] } = useGetHandRaiseQueueQuery(sessionId || '', {
    skip: !sessionId || !isStudentViewer,
    pollingInterval: sessionId && isStudentViewer ? LIVE_HAND_RAISE_POLLING_MS : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();
  const [raiseHand, { isLoading: isRaisingHand }] = useRaiseHandMutation();
  const [lowerHand, { isLoading: isLoweringHand }] = useLowerHandMutation();
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [handErrorMessage, setHandErrorMessage] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<LiveChatMessage[]>(messagesData);
  const [liveHandQueue, setLiveHandQueue] = useState<LiveHandRaise[]>(handQueueData);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const notesStorageKey = `live-notes-${sessionId}`;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const savedNotes = window.localStorage.getItem(notesStorageKey);
    setNotes(savedNotes || '');
  }, [notesStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(notesStorageKey, notes);
  }, [notes, notesStorageKey]);

  useEffect(() => {
    setLiveMessages(sortLiveMessages(messagesData));
  }, [messagesData]);

  useEffect(() => {
    setLiveHandQueue(sortHandRaiseQueue(handQueueData));
  }, [handQueueData]);

  const handleRealtimeChatMessage = useCallback((payload: BackendLiveChatMessageDTO) => {
    const mapped = mapLiveChatMessage(payload);
    setLiveMessages((currentMessages) => mergeLiveMessage(currentMessages, mapped));
  }, []);

  const handleRealtimeHandQueue = useCallback((payload: BackendLiveHandRaiseDTO[]) => {
    const mapped = payload.map(mapLiveHandRaise);
    setLiveHandQueue(sortHandRaiseQueue(mapped));
  }, []);

  const handleRealtimeHandEvent = useCallback((payload: BackendLiveHandRaiseDTO) => {
    const mapped = mapLiveHandRaise(payload);
    setLiveHandQueue((currentQueue) => mergeHandRaiseQueueFromEvent(currentQueue, mapped));
  }, []);

  const realtimeConnected = useLiveRealtimeSocket({
    sessionId,
    enabled: Boolean(sessionId && userId),
    onChatMessage: handleRealtimeChatMessage,
    onHandQueue: isStudentViewer ? handleRealtimeHandQueue : undefined,
    onHandEvent: isStudentViewer ? handleRealtimeHandEvent : undefined,
  });

  useEffect(() => {
    if (activeTab !== 'chat' || !viewportRef.current) {
      return;
    }
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [liveMessages, activeTab, userId]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionId || !userId || !draft.trim()) {
      return;
    }

    setErrorMessage(null);
    try {
      await sendMessage({
        sessionId,
        senderId: userId,
        content: draft,
      }).unwrap();
      setDraft('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible d envoyer le message'));
    }
  };

  const visibleMessages = liveMessages.slice(-30);
  const ownHandRequest = useMemo(() => {
    if (!userId || !isStudentViewer) {
      return null;
    }
    return liveHandQueue.find((entry) => entry.studentId === userId) || null;
  }, [isStudentViewer, liveHandQueue, userId]);
  const firstMessageName =
    visibleMessages.find((message) => message.senderName?.trim())?.senderName || 'Instructor';

  const handleToggleHand = async () => {
    if (!sessionId || !userId || !isStudentViewer) {
      return;
    }

    setHandErrorMessage(null);
    try {
      if (ownHandRequest) {
        await lowerHand({ sessionId, studentId: userId }).unwrap();
      } else {
        await raiseHand({ sessionId, studentId: userId }).unwrap();
      }
    } catch (error) {
      setHandErrorMessage(
        getErrorMessage(error, ownHandRequest ? 'Impossible de baisser la main' : 'Impossible de lever la main'),
      );
    }
  };

  return (
    <aside
      className={`simple-live-chat-dock flex h-full min-h-0 flex-col overflow-hidden border border-slate-200 bg-white ${className || ''}`}
    >
      <div className="grid grid-cols-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center justify-center gap-2 py-4 text-sm font-bold transition ${
            activeTab === 'chat'
              ? 'border-b-2 border-[#1152d4] text-[#1152d4]'
              : 'border-b-2 border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Live Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex items-center justify-center gap-2 py-4 text-sm font-bold transition ${
            activeTab === 'notes'
              ? 'border-b-2 border-[#1152d4] text-[#1152d4]'
              : 'border-b-2 border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          My Notes
        </button>
      </div>

      <div
        ref={viewportRef}
        className="simple-live-chat-viewport flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(to_bottom,#fbfcff_0%,#f5f7fc_100%)] p-5"
      >
        {activeTab === 'chat' ? (
          <div className="space-y-5">
            <div className="flex justify-center">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                {`${firstMessageName} joined the session`}
              </span>
            </div>

            {isFetching ? (
              <div className="flex items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement du chat...
              </div>
            ) : visibleMessages.length ? (
              <div className="space-y-4">
                {visibleMessages.map((message) => {
                  const mine = Boolean(userId && message.senderId === userId);
                  const senderName = (message.senderName || 'Utilisateur').trim();
                  const senderRole = (message.senderRole || '').toLowerCase();
                  const isInstructor = senderRole.includes('teacher') || senderRole.includes('enseign');

                  return (
                    <div key={message.id} className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                          mine
                            ? 'bg-[#1152d4]'
                            : isInstructor
                              ? 'bg-amber-500'
                              : 'bg-slate-500'
                        }`}
                      >
                        {mine ? 'ME' : initialsFromName(senderName)}
                      </div>
                      <div className={`flex max-w-[86%] flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                        <span
                          className={`px-1 text-[11px] font-bold ${
                            isInstructor ? 'text-amber-600' : 'text-slate-500'
                          }`}
                        >
                          {mine ? 'You' : senderName}
                        </span>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                            mine
                              ? 'rounded-tr-none bg-[#1152d4] text-white'
                              : isInstructor
                                ? 'rounded-tl-none border border-amber-200 bg-amber-50 text-slate-800'
                                : 'rounded-tl-none bg-slate-100 text-slate-800'
                          }`}
                        >
                          {message.content}
                        </div>
                        <span className="px-1 text-[10px] text-slate-400">
                          {formatMessageClock(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                Aucun message pour cette session.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Notes privees
            </p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ajoutez vos notes ici..."
              className="min-h-[380px] resize-none rounded-xl border-slate-200 bg-white/90 text-sm text-slate-700 focus:border-[#1152d4] focus:ring-[#1152d4]/25"
            />
            <p className="text-[11px] text-slate-400">
              Sauvegarde locale automatique sur cet appareil.
            </p>
          </div>
        )}
      </div>

      {activeTab === 'chat' ? (
        <form onSubmit={handleSend} className="border-t border-slate-200 bg-white/70 p-4 backdrop-blur">
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:text-[#1152d4]"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={userId ? 'Type a message...' : 'Connectez-vous pour chatter'}
                className="h-9 flex-1 border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
                disabled={!userId || isSending}
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 w-9 rounded-xl bg-[#1152d4] p-0 text-white hover:bg-[#0f47b9]"
                disabled={!userId || !draft.trim() || isSending}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 text-slate-400">
              <button type="button" className="transition hover:text-slate-600">
                <Smile className="h-4 w-4" />
              </button>
              <button type="button" className="transition hover:text-slate-600">
                <Paperclip className="h-4 w-4" />
              </button>
              <button type="button" className="transition hover:text-slate-600">
                <AtSign className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.11em] ${
                  realtimeConnected ? 'text-emerald-500' : 'text-slate-400'
                }`}
              >
                {realtimeConnected ? 'Live sync' : 'Polling'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-slate-400">
                Enter to send
              </span>
            </div>
          </div>

          {isStudentViewer ? (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {ownHandRequest ? 'Votre main est levee.' : 'Demander la parole en direct.'}
              </span>
              <Button
                type="button"
                size="sm"
                variant={ownHandRequest ? 'outline' : 'default'}
                className={ownHandRequest ? 'h-8 rounded-full' : 'h-8 rounded-full bg-[#1152d4] hover:bg-[#0f47b9]'}
                disabled={!userId || isRaisingHand || isLoweringHand}
                onClick={() => {
                  void handleToggleHand();
                }}
              >
                {isRaisingHand || isLoweringHand ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Hand className="mr-2 h-3.5 w-3.5" />
                )}
                {ownHandRequest ? 'Baisser la main' : 'Lever la main'}
              </Button>
            </div>
          ) : null}

          {errorMessage ? <p className="mt-2 text-xs text-red-600">{errorMessage}</p> : null}
          {handErrorMessage ? <p className="mt-1 text-xs text-red-600">{handErrorMessage}</p> : null}
        </form>
      ) : (
        <div className="border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-400">
          {notes.trim().length} caractere(s) notes
        </div>
      )}
    </aside>
  );
}
