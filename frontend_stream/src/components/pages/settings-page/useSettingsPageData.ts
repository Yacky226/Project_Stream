import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/redux';
import { useTranslation } from '../../../lib/i18n';
import { normalizeUserRole } from '../../../lib/roleUtils';
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '../../../store/api/userApi';
import { setLanguage as setUiLanguage, setTheme } from '../../../store/slices/uiSlice';
import type { UserPreferences } from '../../../types/user';
import { useAdminSpaceData } from '../../admin/AdminSpaceShared';
import { useStudentSpaceData } from '../../student/StudentSpaceShared';
import { useTeacherSpaceData } from '../../teacher/TeacherSpaceShared';
import { applyTheme, createPreferencesExport } from './settingsPage.utils';

export type SettingsTab = 'general' | 'notifications' | 'privacy' | 'account';

type StudentSharedData = ReturnType<typeof useStudentSpaceData>;
type TeacherSharedData = ReturnType<typeof useTeacherSpaceData>;
type AdminSharedData = ReturnType<typeof useAdminSpaceData>;

export interface SettingsPageDataModel {
  settingsTitle: string;
  userEmail: string;
  authLoading: boolean;
  preferencesLoading: boolean;
  preferencesError: unknown;
  isSaving: boolean;
  submitError: string | null;
  submitSuccess: string | null;
  selectedTab: SettingsTab;
  localPreferences: UserPreferences | null;
  canSave: boolean;
  studentShared: StudentSharedData;
  teacherShared: TeacherSharedData;
  adminShared: AdminSharedData;
  isStudentAccountPage: boolean;
  isTeacherAccountPage: boolean;
  isAdminAccountPage: boolean;
  setSelectedTab: (value: SettingsTab) => void;
  handlePartialUpdate: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  handleSave: () => Promise<void>;
  handleExportData: () => void;
}

interface UseSettingsPageDataParams {
  onNavigate: (path: string | number) => void;
}

export function useSettingsPageData({ onNavigate }: UseSettingsPageDataParams): SettingsPageDataModel {
  const dispatch = useAppDispatch();
  const { t, setLanguage: setI18nLanguage } = useTranslation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const studentShared = useStudentSpaceData({ includeDashboard: false });
  const teacherShared = useTeacherSpaceData({ includeDashboard: false });
  const adminShared = useAdminSpaceData({ includeDashboard: false });

  const normalizedRole = normalizeUserRole(user?.role);
  const isStudentAccountPage = normalizedRole === 'student';
  const isTeacherAccountPage = normalizedRole === 'teacher';
  const isAdminAccountPage = normalizedRole === 'admin';

  const {
    data: remotePreferences,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useGetPreferencesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updatePreferences, { isLoading: isSaving }] = useUpdatePreferencesMutation();
  const [selectedTab, setSelectedTab] = useState<SettingsTab>('general');
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      onNavigate('/auth/signin');
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  useEffect(() => {
    if (!remotePreferences) {
      return;
    }

    setLocalPreferences(remotePreferences);
    applyTheme(remotePreferences.theme);
    dispatch(setTheme(remotePreferences.theme));
    dispatch(setUiLanguage(remotePreferences.language));
    setI18nLanguage(remotePreferences.language);
    document.documentElement.lang = remotePreferences.language;
  }, [dispatch, remotePreferences, setI18nLanguage]);

  const canSave = useMemo(() => {
    if (!localPreferences || !remotePreferences) {
      return false;
    }

    return JSON.stringify(localPreferences) !== JSON.stringify(remotePreferences);
  }, [localPreferences, remotePreferences]);

  const handlePartialUpdate = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setLocalPreferences((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!localPreferences) {
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const saved = await updatePreferences(localPreferences).unwrap();

      applyTheme(saved.theme);
      dispatch(setTheme(saved.theme));
      dispatch(setUiLanguage(saved.language));
      setI18nLanguage(saved.language);
      document.documentElement.lang = saved.language;
      setLocalPreferences(saved);
      setSubmitSuccess('Parametres sauvegardes avec succes.');
    } catch (error) {
      const payload = error as { data?: { message?: string; error?: string } };
      setSubmitError(payload?.data?.message || payload?.data?.error || 'Sauvegarde impossible.');
    }
  };

  const handleExportData = () => {
    if (!localPreferences) {
      return;
    }

    const content = createPreferencesExport(localPreferences);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `user-preferences-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  return {
    settingsTitle: t('common.settings'),
    userEmail: user?.email || 'N/A',
    authLoading,
    preferencesLoading,
    preferencesError,
    isSaving,
    submitError,
    submitSuccess,
    selectedTab,
    localPreferences,
    canSave,
    studentShared,
    teacherShared,
    adminShared,
    isStudentAccountPage,
    isTeacherAccountPage,
    isAdminAccountPage,
    setSelectedTab,
    handlePartialUpdate,
    handleSave,
    handleExportData,
  };
}
