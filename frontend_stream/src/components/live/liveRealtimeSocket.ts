import { useEffect, useRef, useState } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAppSelector } from '../../hooks/redux';
import { API_BASE_URL } from '../../lib/api-base-url';
import type {
  BackendLiveChatMessageDTO,
  BackendLiveHandRaiseDTO,
  LiveChatMessage,
  LiveHandRaise,
} from '../../types/live';

const WS_STREAM_ENDPOINT = `${API_BASE_URL.replace(/\/+$/, '')}/ws-stream`;

function parseStompBody<T>(message: IMessage): T | null {
  if (!message.body) {
    return null;
  }
  try {
    return JSON.parse(message.body) as T;
  } catch {
    return null;
  }
}

function toTimestamp(value?: string | null): number {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortLiveMessages(messages: LiveChatMessage[]): LiveChatMessage[] {
  return [...messages].sort((left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt));
}

export function mergeLiveMessage(
  currentMessages: LiveChatMessage[],
  incomingMessage: LiveChatMessage,
): LiveChatMessage[] {
  const withoutDuplicate = currentMessages.filter((entry) => entry.id !== incomingMessage.id);
  const merged = sortLiveMessages([...withoutDuplicate, incomingMessage]);
  return merged.slice(-200);
}

function normalizeHandRaiseStatus(status?: string | null): string {
  return String(status || '').trim().toUpperCase();
}

export function sortHandRaiseQueue(queue: LiveHandRaise[]): LiveHandRaise[] {
  return [...queue].sort((left, right) => {
    const orderLeft = left.order ?? Number.MAX_SAFE_INTEGER;
    const orderRight = right.order ?? Number.MAX_SAFE_INTEGER;
    if (orderLeft !== orderRight) {
      return orderLeft - orderRight;
    }
    return toTimestamp(left.requestedAt) - toTimestamp(right.requestedAt);
  });
}

export function mergeHandRaiseQueueFromEvent(
  currentQueue: LiveHandRaise[],
  incomingEntry: LiveHandRaise,
): LiveHandRaise[] {
  const normalizedStatus = normalizeHandRaiseStatus(incomingEntry.status);
  const withoutDuplicate = currentQueue.filter((entry) => entry.id !== incomingEntry.id);

  if (normalizedStatus === 'PENDING') {
    return sortHandRaiseQueue([...withoutDuplicate, incomingEntry]);
  }

  return sortHandRaiseQueue(withoutDuplicate);
}

interface LiveRealtimeSocketOptions {
  sessionId: string | null | undefined;
  enabled: boolean;
  onChatMessage?: (payload: BackendLiveChatMessageDTO) => void;
  onHandQueue?: (payload: BackendLiveHandRaiseDTO[]) => void;
  onHandEvent?: (payload: BackendLiveHandRaiseDTO) => void;
}

export function useLiveRealtimeSocket({
  sessionId,
  enabled,
  onChatMessage,
  onHandQueue,
  onHandEvent,
}: LiveRealtimeSocketOptions): boolean {
  const token = useAppSelector((state) => state.auth.token);
  const [isConnected, setIsConnected] = useState(false);
  const chatHandlerRef = useRef<LiveRealtimeSocketOptions['onChatMessage']>(onChatMessage);
  const handQueueHandlerRef = useRef<LiveRealtimeSocketOptions['onHandQueue']>(onHandQueue);
  const handEventHandlerRef = useRef<LiveRealtimeSocketOptions['onHandEvent']>(onHandEvent);

  useEffect(() => {
    chatHandlerRef.current = onChatMessage;
  }, [onChatMessage]);

  useEffect(() => {
    handQueueHandlerRef.current = onHandQueue;
  }, [onHandQueue]);

  useEffect(() => {
    handEventHandlerRef.current = onHandEvent;
  }, [onHandEvent]);

  useEffect(() => {
    if (!enabled || !sessionId || !token) {
      setIsConnected(false);
      return;
    }

    let disposed = false;
    const subscriptions: StompSubscription[] = [];
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_STREAM_ENDPOINT),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {
        // Intentionally muted in production to avoid noisy logs.
      },
    });

    const subscribeToDestination = (
      destination: string,
      listener: (message: IMessage) => void,
    ) => {
      const subscription = client.subscribe(destination, (message) => {
        if (disposed) {
          return;
        }
        listener(message);
      });
      subscriptions.push(subscription);
    };

    client.onConnect = () => {
      if (disposed) {
        return;
      }

      setIsConnected(true);

      if (chatHandlerRef.current) {
        subscribeToDestination(`/topic/chat/${sessionId}`, (message) => {
          const payload = parseStompBody<BackendLiveChatMessageDTO>(message);
          if (payload) {
            chatHandlerRef.current?.(payload);
          }
        });
      }

      if (handQueueHandlerRef.current) {
        subscribeToDestination(`/topic/handraises/${sessionId}/queue`, (message) => {
          const payload = parseStompBody<BackendLiveHandRaiseDTO[]>(message);
          if (Array.isArray(payload)) {
            handQueueHandlerRef.current?.(payload);
          }
        });
      }

      if (handEventHandlerRef.current) {
        const handEventDestinations = [
          `/topic/handraises/${sessionId}`,
          `/topic/handraises/${sessionId}/lowered`,
          `/topic/handraises/${sessionId}/granted`,
          `/topic/handraises/${sessionId}/completed`,
        ];

        handEventDestinations.forEach((destination) => {
          subscribeToDestination(destination, (message) => {
            const payload = parseStompBody<BackendLiveHandRaiseDTO>(message);
            if (payload) {
              handEventHandlerRef.current?.(payload);
            }
          });
        });
      }
    };

    client.onStompError = () => {
      if (!disposed) {
        setIsConnected(false);
      }
    };

    client.onWebSocketClose = () => {
      if (!disposed) {
        setIsConnected(false);
      }
    };

    client.onWebSocketError = () => {
      if (!disposed) {
        setIsConnected(false);
      }
    };

    client.activate();

    return () => {
      disposed = true;
      setIsConnected(false);
      subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch {}
      });
      void client.deactivate();
    };
  }, [enabled, sessionId, token]);

  return isConnected;
}

