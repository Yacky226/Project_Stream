import { useEffect, useMemo, useRef, useState, type ChangeEvent, type RefObject } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/redux';
import { getUserRoleLabel, normalizeUserRole } from '../../../lib/roleUtils';
import {
  useGetPreferencesQuery,
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetTeacherSpecialtyQuery,
  useGetUnreadNotificationCountQuery,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '../../../store/api/userApi';
import { updateProfile as updateAuthProfile } from '../../../store/slices/authSlice';
import type { UserPreferences } from '../../../types/user';
import type {
  AccountHubPageProps,
  AccountTab,
  LocalProfileExtras,
  ProfileFormState,
} from './accountHub.types';
import {
  DEFAULT_EXTRAS,
  exportAccountData,
  getDashboardPath,
  getExtrasStorageKey,
  toInputDate,
} from './accountHub.utils';

type ProfileData = ReturnType<typeof useGetProfileQuery>['data'];

export interface AccountHubDataModel {
  activeTab: AccountTab;
  authLoading: boolean;
  profileLoading: boolean;
  preferencesLoading: boolean;
  profileError: unknown;
  preferencesError: unknown;
  submitError: string | null;
  submitSuccess: string | null;
  profile: ProfileData;
  profileForm: ProfileFormState;
  extras: LocalProfileExtras;
  preferencesForm: UserPreferences | null;
  unreadCount: number;
  roleMeta: string;
  profileStrength: number;
  isSaving: boolean;
  hasChanges: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  setActiveTab: (tab: AccountTab) => void;
  updateProfileField: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void;
  updateExtraField: <K extends keyof LocalProfileExtras>(key: K, value: LocalProfileExtras[K]) => void;
  updatePreferenceField: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  handleReset: () => void;
  handleAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSave: () => Promise<void>;
  handleExport: () => void;
  getProfileAction: () => { label: string; path: string };
  getRoleLabel: () => string;
  navigateToSigninIfNeeded: boolean;
}

export function useAccountHubData({
  onNavigate,
  initialTab = 'personal',
}: AccountHubPageProps): AccountHubDataModel {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    dateNaissance: '',
    avatar: '',
  });
  const [extras, setExtras] = useState<LocalProfileExtras>(DEFAULT_EXTRAS);
  const [preferencesForm, setPreferencesForm] = useState<UserPreferences | null>(null);
  const [savedProfile, setSavedProfile] = useState<ProfileFormState | null>(null);
  const [savedExtras, setSavedExtras] = useState<LocalProfileExtras>(DEFAULT_EXTRAS);
  const [savedPreferences, setSavedPreferences] = useState<UserPreferences | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const {
    data: preferences,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useGetPreferencesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated,
  });

  const role = normalizeUserRole(profile?.role);
  const { data: studentLevel } = useGetStudentLevelQuery(undefined, {
    skip: !profile || role !== 'student' || Boolean(profile?.niveau),
  });
  const { data: teacherSpecialty } = useGetTeacherSpecialtyQuery(undefined, {
    skip: !profile || role !== 'teacher' || Boolean(profile?.specialite),
  });

  const [updateProfileMutation, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [updatePreferencesMutation, { isLoading: isSavingPreferences }] =
    useUpdatePreferencesMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      onNavigate('/auth/signin');
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  useEffect(() => {
    if (!profile) return;
    const nextProfile = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      dateNaissance: toInputDate(profile.dateNaissance),
      avatar: profile.avatar || '',
    };
    setProfileForm(nextProfile);
    setSavedProfile(nextProfile);

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(getExtrasStorageKey(profile.id));
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as LocalProfileExtras;
          const merged = { ...DEFAULT_EXTRAS, ...parsed };
          setExtras(merged);
          setSavedExtras(merged);
        } catch {
          setExtras(DEFAULT_EXTRAS);
          setSavedExtras(DEFAULT_EXTRAS);
        }
      } else {
        setExtras(DEFAULT_EXTRAS);
        setSavedExtras(DEFAULT_EXTRAS);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!preferences) return;
    setPreferencesForm(preferences);
    setSavedPreferences(preferences);
  }, [preferences]);

  const roleMeta = useMemo(() => {
    if (role === 'student') return studentLevel || profile?.niveau || 'Learner';
    if (role === 'teacher') return teacherSpecialty || profile?.specialite || 'Instructor';
    return 'Administration';
  }, [profile?.niveau, profile?.specialite, role, studentLevel, teacherSpecialty]);

  const profileStrength = useMemo(() => {
    const checks = [
      Boolean(profileForm.firstName.trim()),
      Boolean(profileForm.lastName.trim()),
      Boolean(profile?.email),
      Boolean(profileForm.avatar),
      Boolean(profileForm.dateNaissance),
      Boolean(extras.bio.trim()),
      Boolean(extras.website.trim() || extras.linkedIn.trim() || extras.twitter.trim()),
      Boolean(extras.location.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [extras, profile?.email, profileForm]);

  const hasChanges = useMemo(
    () =>
      JSON.stringify(profileForm) !== JSON.stringify(savedProfile) ||
      JSON.stringify(extras) !== JSON.stringify(savedExtras) ||
      JSON.stringify(preferencesForm) !== JSON.stringify(savedPreferences),
    [extras, preferencesForm, profileForm, savedExtras, savedPreferences, savedProfile],
  );

  const isSaving = isSavingProfile || isSavingPreferences || isUploadingAvatar;

  const updateProfileField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setProfileForm((current) => ({ ...current, [key]: value }));
  };

  const updateExtraField = <K extends keyof LocalProfileExtras>(
    key: K,
    value: LocalProfileExtras[K],
  ) => {
    setExtras((current) => ({ ...current, [key]: value }));
  };

  const updatePreferenceField = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    setPreferencesForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleReset = () => {
    if (savedProfile) setProfileForm(savedProfile);
    setExtras(savedExtras);
    if (savedPreferences) setPreferencesForm(savedPreferences);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadAvatar(formData).unwrap();
      setProfileForm((current) => ({ ...current, avatar: result.avatarUrl }));
      setSubmitSuccess('Nouvelle photo chargee. Pensez a sauvegarder.');
    } catch (error) {
      const payload = error as { data?: { message?: string; error?: string } };
      setSubmitError(payload?.data?.message || payload?.data?.error || 'Upload impossible.');
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!profile || !preferencesForm) return;
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const updatedProfile = await updateProfileMutation({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        dateNaissance: profileForm.dateNaissance || null,
        avatar: profileForm.avatar.trim() || null,
      }).unwrap();

      const updatedPreferences = await updatePreferencesMutation(preferencesForm).unwrap();

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(getExtrasStorageKey(profile.id), JSON.stringify(extras));
      }

      dispatch(
        updateAuthProfile({
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          avatar: updatedProfile.avatar,
          dateNaissance: updatedProfile.dateNaissance,
        }),
      );

      const nextSavedProfile = {
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        dateNaissance: toInputDate(updatedProfile.dateNaissance),
        avatar: updatedProfile.avatar || '',
      };

      setProfileForm(nextSavedProfile);
      setSavedProfile(nextSavedProfile);
      setSavedExtras(extras);
      setPreferencesForm(updatedPreferences);
      setSavedPreferences(updatedPreferences);
      setSubmitSuccess('Profil et preferences enregistres avec succes.');
    } catch (error) {
      const payload = error as { data?: { message?: string; error?: string } };
      setSubmitError(
        payload?.data?.message || payload?.data?.error || 'Enregistrement impossible.',
      );
    }
  };

  const handleExport = () => {
    if (!profile || !preferencesForm) return;
    exportAccountData({ profile, preferences: preferencesForm, extras });
  };

  const getProfileAction = () => {
    const path =
      role === 'student'
        ? '/profile/public'
        : role === 'teacher'
          ? `/profile/teacher/${profile?.id}`
          : getDashboardPath(role);
    const label =
      role === 'student' || role === 'teacher' ? 'View Public Profile' : 'View Dashboard';
    return { label, path };
  };

  const getRoleLabel = () => getUserRoleLabel(profile?.role);

  return {
    activeTab,
    authLoading,
    profileLoading,
    preferencesLoading,
    profileError,
    preferencesError,
    submitError,
    submitSuccess,
    profile,
    profileForm,
    extras,
    preferencesForm,
    unreadCount,
    roleMeta,
    profileStrength,
    isSaving,
    hasChanges,
    fileInputRef,
    setActiveTab,
    updateProfileField,
    updateExtraField,
    updatePreferenceField,
    handleReset,
    handleAvatarUpload,
    handleSave,
    handleExport,
    getProfileAction,
    getRoleLabel,
    navigateToSigninIfNeeded: !authLoading && !isAuthenticated,
  };
}
