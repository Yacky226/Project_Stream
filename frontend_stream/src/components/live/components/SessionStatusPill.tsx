import { Radio } from 'lucide-react';
import { Badge } from '../../ui/badge';
import type { LiveSession } from '../../../types/live';
import { getSessionStatusLabel, getSessionStatusVariant } from '../liveSession.utils';

export function SessionStatusPill({ session }: { session: LiveSession }) {
  return (
    <Badge variant={getSessionStatusVariant(session.status, session.isLive)}>
      {session.isLive ? <Radio className="mr-1 h-3 w-3" /> : null}
      {getSessionStatusLabel(session.status, session.isLive)}
    </Badge>
  );
}
