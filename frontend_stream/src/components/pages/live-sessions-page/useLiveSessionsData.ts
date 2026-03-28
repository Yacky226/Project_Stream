import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { useGetAllSessionsQuery } from '../../../store/api/liveApi';
import type { LiveSessionsDataModel, StatusFilter } from './liveSessions.types';
import { filterSessions } from './liveSessions.utils';

export function useLiveSessionsData(): LiveSessionsDataModel {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const canManage = user?.role === 'teacher' || user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useGetAllSessionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const filteredSessions = useMemo(
    () => filterSessions(sessions, searchQuery, statusFilter),
    [sessions, searchQuery, statusFilter],
  );

  const liveCount = useMemo(
    () => sessions.filter((session) => session.isLive || session.status === 'LIVE').length,
    [sessions],
  );

  const upcomingCount = useMemo(
    () => sessions.filter((session) => !session.isLive && session.status !== 'ENDED').length,
    [sessions],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const refreshSessions = () => {
    void refetch();
  };

  return {
    canManage,
    filteredSessions,
    hasError: Boolean(error),
    isAuthenticated,
    isLoading,
    liveCount,
    refreshSessions,
    resetFilters,
    searchQuery,
    sessions,
    setSearchQuery,
    setStatusFilter,
    statusFilter,
    upcomingCount,
  };
}
