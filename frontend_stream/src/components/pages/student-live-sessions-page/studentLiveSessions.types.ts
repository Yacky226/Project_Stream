import type { LiveSession } from '../../../types/live';

export interface StudentLiveSessionsPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export type SessionFilter = 'all' | 'live' | 'upcoming' | 'ended';

export interface EnrichedStudentLiveSession extends LiveSession {
  title: string;
}

export interface StudentLiveSessionsSummary {
  liveCount: number;
  upcomingCount: number;
}

export interface StudentLiveSessionsQueryState {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filter: SessionFilter;
  setFilter: (value: SessionFilter) => void;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}
