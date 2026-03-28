import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Brain,
  ExternalLink,
  Globe,
  Share2,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGetStudentDashboardQuery } from '../../../store/api/dashboardApi';
import {
  useGetPreferencesQuery,
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetUnreadNotificationCountQuery,
} from '../../../store/api/userApi';
import type {
  LocalProfileExtras,
  PublicStudentProfileDataModel,
  SocialLink,
} from './publicStudentProfile.types';
import {
  DEFAULT_EXTRAS,
  getDistinctActivityDays,
  getErrorMessage,
  getExtrasStorageKey,
  sanitizeUrl,
} from './publicStudentProfile.utils';

export function usePublicStudentProfileData(): PublicStudentProfileDataModel {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const shouldLoad = Boolean(isAuthenticated && user?.role === 'student' && user?.id);
  const [extras, setExtras] = useState<LocalProfileExtras>(DEFAULT_EXTRAS);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(
    undefined,
    { skip: !shouldLoad },
  );
  const { data: preferences } = useGetPreferencesQuery(undefined, { skip: !shouldLoad });
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetStudentDashboardQuery(undefined, { skip: !shouldLoad });
  const { data: level } = useGetStudentLevelQuery(undefined, {
    skip: !shouldLoad || Boolean(profile?.niveau),
  });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !shouldLoad,
  });

  useEffect(() => {
    if (!profile || typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(getExtrasStorageKey(profile.id));
    if (!raw) {
      setExtras(DEFAULT_EXTRAS);
      return;
    }
    try {
      setExtras({ ...DEFAULT_EXTRAS, ...(JSON.parse(raw) as LocalProfileExtras) });
    } catch {
      setExtras(DEFAULT_EXTRAS);
    }
  }, [profile]);

  const completedCourses = useMemo(
    () =>
      (dashboard?.courses || []).filter(
        (course) => course.status === 'TERMINE' || course.progress >= 100,
      ),
    [dashboard?.courses],
  );

  const currentCourses = useMemo(
    () =>
      (dashboard?.courses || [])
        .filter((course) => course.status !== 'TERMINE' && course.progress > 0)
        .sort((left, right) => right.progress - left.progress)
        .slice(0, 3),
    [dashboard?.courses],
  );

  const activityDays = useMemo(
    () => getDistinctActivityDays((dashboard?.recentActivity || []).map((activity) => activity.occurredAt)),
    [dashboard?.recentActivity],
  );

  const badges = useMemo(
    () => [
      { label: 'Quick Learner', active: (dashboard?.stats.completedCourses || 0) > 0, icon: Sparkles },
      { label: 'Problem Solver', active: (dashboard?.stats.averageProgress || 0) >= 50, icon: Brain },
      { label: 'Collaborator', active: (dashboard?.recentActivity.length || 0) >= 3, icon: Users },
      { label: 'Gold Tier', active: (dashboard?.stats.averageProgress || 0) >= 80, icon: Award },
      { label: 'Verified', active: Boolean(preferences?.allowProfileViews), icon: Shield },
    ],
    [
      dashboard?.recentActivity.length,
      dashboard?.stats.averageProgress,
      dashboard?.stats.completedCourses,
      preferences?.allowProfileViews,
    ],
  );

  const socialLinks = useMemo<SocialLink[]>(
    () => [
      { label: 'Website', url: sanitizeUrl(extras.website), icon: Globe },
      { label: 'LinkedIn', url: sanitizeUrl(extras.linkedIn), icon: ExternalLink },
      { label: 'Social', url: sanitizeUrl(extras.twitter), icon: Share2 },
    ].filter((item) => Boolean(item.url)),
    [extras.linkedIn, extras.twitter, extras.website],
  );

  const displayName = `${profile?.firstName || user?.firstName || 'Student'} ${profile?.lastName || user?.lastName || ''}`.trim();
  const publicEnabled = preferences?.allowProfileViews ?? true;
  const showStatus = preferences?.showOnlineStatus ?? true;

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '/profile/public';
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: `${displayName} - Public Profile`, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setShareState('copied');
    } catch {
      setShareState('error');
    }

    if (typeof window !== 'undefined') {
      window.setTimeout(() => setShareState('idle'), 2200);
    } else {
      setShareState('idle');
    }
  };

  let status: PublicStudentProfileDataModel['status'] = 'loading';
  if (!authLoading && !isAuthenticated) {
    status = 'auth-required';
  } else if (!authLoading && isAuthenticated && user?.role !== 'student') {
    status = 'wrong-role';
  } else if (profileLoading || dashboardLoading || authLoading) {
    status = 'loading';
  } else if (!profile || !dashboard) {
    status = 'error';
  } else {
    status = 'ready';
  }

  const errorMessage =
    status === 'error'
      ? getErrorMessage(profileError || dashboardError, 'Impossible de charger votre profil public.')
      : null;

  return {
    activityDays,
    badges,
    completedCourses,
    currentCourses,
    dashboard: dashboard || null,
    displayName,
    errorMessage,
    extras,
    handleShare,
    level,
    preferences,
    profile: profile || null,
    publicEnabled,
    shareState,
    showStatus,
    socialLinks,
    status,
    unreadCount,
  };
}
