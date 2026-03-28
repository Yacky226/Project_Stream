import type { LiveSession } from '../../../types/live';

export interface LiveSessionsPageProps {
  onNavigate: (path: string) => void;
}

export type StatusFilter = 'all' | 'live' | 'scheduled' | 'ended';

export interface LiveSessionsDataModel {
  isAuthenticated: boolean;
  canManage: boolean;
  sessions: LiveSession[];
  filteredSessions: LiveSession[];
  searchQuery: string;
  statusFilter: StatusFilter;
  liveCount: number;
  upcomingCount: number;
  isLoading: boolean;
  hasError: boolean;
  setSearchQuery: (value: string) => void;
  setStatusFilter: (value: StatusFilter) => void;
  resetFilters: () => void;
  refreshSessions: () => void;
}
