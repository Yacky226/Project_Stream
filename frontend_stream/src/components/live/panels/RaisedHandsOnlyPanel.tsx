import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useGetHandRaiseQueueQuery } from '../../../store/api/liveApi';
import { mapLiveHandRaise, type BackendLiveHandRaiseDTO, type LiveHandRaise } from '../../../types/live';
import {
  mergeHandRaiseQueueFromEvent,
  sortHandRaiseQueue,
  useLiveRealtimeSocket,
} from '../liveRealtimeSocket';
import { formatSessionDate } from '../liveSession.utils';
import { LIVE_HAND_RAISE_POLLING_MS } from '../liveConstants';

type RaisedHandSortMode = 'queue' | 'newest' | 'name';

export function RaisedHandsOnlyPanel({ sessionId }: { sessionId: string | null }) {
  const shouldSkip = !sessionId;
  const { data: queueData = [], isFetching } = useGetHandRaiseQueueQuery(sessionId || '', {
    skip: shouldSkip,
    pollingInterval: shouldSkip ? 0 : LIVE_HAND_RAISE_POLLING_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [sortMode, setSortMode] = useState<RaisedHandSortMode>('queue');
  const [liveQueue, setLiveQueue] = useState<LiveHandRaise[]>(queueData);

  useEffect(() => {
    setLiveQueue(sortHandRaiseQueue(queueData));
  }, [queueData]);

  const handleRealtimeQueue = useCallback((payload: BackendLiveHandRaiseDTO[]) => {
    const mapped = payload.map(mapLiveHandRaise);
    setLiveQueue(sortHandRaiseQueue(mapped));
  }, []);

  const handleRealtimeHandEvent = useCallback((payload: BackendLiveHandRaiseDTO) => {
    const mapped = mapLiveHandRaise(payload);
    setLiveQueue((currentQueue) => mergeHandRaiseQueueFromEvent(currentQueue, mapped));
  }, []);

  useLiveRealtimeSocket({
    sessionId,
    enabled: !shouldSkip,
    onHandQueue: handleRealtimeQueue,
    onHandEvent: handleRealtimeHandEvent,
  });

  const sortedQueue = useMemo(() => {
    const items = [...liveQueue];
    const getTime = (value: string | null) => {
      if (!value) {
        return 0;
      }
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    if (sortMode === 'newest') {
      return items.sort((a, b) => getTime(b.requestedAt) - getTime(a.requestedAt));
    }

    if (sortMode === 'name') {
      return items.sort((a, b) => a.studentName.localeCompare(b.studentName, 'fr', { sensitivity: 'base' }));
    }

    return items.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return getTime(a.requestedAt) - getTime(b.requestedAt);
    });
  }, [liveQueue, sortMode]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          {sortedQueue.length} participant{sortedQueue.length > 1 ? 's' : ''} avec la main levee
        </p>
        <div className="w-full sm:w-56">
          <Select value={sortMode} onValueChange={(value) => setSortMode(value as RaisedHandSortMode)}>
            <SelectTrigger className="h-9 rounded-full border-slate-300 bg-white text-sm text-slate-700">
              <SelectValue placeholder="Trier la liste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="queue">Ordre de la file</SelectItem>
              <SelectItem value="newest">Plus recents</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-h-[65vh] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {isFetching ? (
          <div className="flex h-24 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement des mains levees...
          </div>
        ) : sortedQueue.length ? (
          sortedQueue.map((entry: LiveHandRaise) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{entry.studentName}</p>
                <p className="text-xs text-slate-500">
                  Levee: {entry.requestedAt ? formatSessionDate(entry.requestedAt) : 'N/A'}
                </p>
              </div>
              {entry.order !== null ? (
                <Badge variant="outline" className="whitespace-nowrap">
                  #{entry.order}
                </Badge>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Aucune main levee pour le moment.</p>
        )}
      </div>
    </div>
  );
}
