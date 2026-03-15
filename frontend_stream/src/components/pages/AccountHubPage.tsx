import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Download,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/redux';
import { getUserRoleLabel, normalizeUserRole } from '../../lib/roleUtils';
import { updateProfile as updateAuthProfile } from '../../store/slices/authSlice';
import {
  useGetPreferencesQuery,
  useGetProfileQuery,
  useGetStudentLevelQuery,
  useGetTeacherSpecialtyQuery,
  useGetUnreadNotificationCountQuery,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '../../store/api/userApi';
import type { UserPreferences } from '../../types/user';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

type AccountTab = 'personal' | 'security' | 'billing' | 'notifications';

interface AccountHubPageProps {
  onNavigate: (path: string | number) => void;
  initialTab?: AccountTab;
}

interface LocalProfileExtras {
  bio: string;
  location: string;
  twitter: string;
  linkedIn: string;
  website: string;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
  dateNaissance: string;
  avatar: string;
}

const DEFAULT_EXTRAS: LocalProfileExtras = {
  bio: '',
  location: '',
  twitter: '',
  linkedIn: '',
  website: '',
};

function toInputDate(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = value.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return '';
}

function toDisplayDate(value?: string | null): string {
  if (!value) return 'Member since recently';
  try {
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(new Date(value));
  } catch {
    return 'Member';
  }
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'U';
}

function getDashboardPath(role?: string): string {
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

function getExtrasStorageKey(userId?: string) {
  return `account-hub-extras-${userId || 'guest'}`;
}

function exportAccountData(payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `account-hub-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export function AccountHubPage({ onNavigate, initialTab = 'personal' }: AccountHubPageProps) {
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

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = useGetPreferencesQuery(undefined, {
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
  const [updatePreferencesMutation, { isLoading: isSavingPreferences }] = useUpdatePreferencesMutation();
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
  }, [role, studentLevel, teacherSpecialty, profile?.niveau, profile?.specialite]);

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
  }, [profileForm, extras, profile?.email]);

  const hasChanges =
    JSON.stringify(profileForm) !== JSON.stringify(savedProfile) ||
    JSON.stringify(extras) !== JSON.stringify(savedExtras) ||
    JSON.stringify(preferencesForm) !== JSON.stringify(savedPreferences);

  const isSaving = isSavingProfile || isSavingPreferences || isUploadingAvatar;

  const handleReset = () => {
    if (savedProfile) setProfileForm(savedProfile);
    setExtras(savedExtras);
    if (savedPreferences) setPreferencesForm(savedPreferences);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setSubmitError(payload?.data?.message || payload?.data?.error || 'Enregistrement impossible.');
    }
  };

  if (authLoading || profileLoading || preferencesLoading || !preferencesForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger votre profil.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100" style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/85 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#1152d4] p-2 text-white"><Settings className="h-5 w-5" /></div>
            <h2 className="text-lg font-bold tracking-tight">User Profile & Settings</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative rounded-xl" onClick={() => onNavigate('/notifications')}>
              <Mail className="h-4 w-4" />
              {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl" onClick={() => onNavigate('/help')}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8 border border-[#1152d4]/20">
              <AvatarImage src={profileForm.avatar || undefined} />
              <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">{getInitials(profileForm.firstName, profileForm.lastName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {(profileError || preferencesError || submitError || submitSuccess) ? (
          <div className="mb-6 space-y-3">
            {profileError || preferencesError || submitError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError || 'Un probleme est survenu pendant le chargement du compte.'}</AlertDescription>
              </Alert>
            ) : null}
            {submitSuccess ? <Alert><AlertDescription>{submitSuccess}</AlertDescription></Alert> : null}
          </div>
        ) : null}

        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg dark:border-slate-800">
                <AvatarImage src={profileForm.avatar || undefined} />
                <AvatarFallback className="bg-[#1152d4]/10 text-3xl font-bold text-[#1152d4]">{getInitials(profileForm.firstName, profileForm.lastName)}</AvatarFallback>
              </Avatar>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#1152d4] p-2 text-white shadow-lg dark:border-slate-900">
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profileForm.firstName} {profileForm.lastName}</h1>
              <p className="font-medium text-slate-500 dark:text-slate-400">{getUserRoleLabel(profile.role)} • {roleMeta}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 md:justify-start">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {extras.location || 'Location to complete'}</span>
                <span>{toDisplayDate(profile.createdAt)}</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 md:w-auto">
              <Button
                className="rounded-xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
                onClick={() =>
                  onNavigate(
                    role === 'student'
                      ? '/profile/public'
                      : role === 'teacher'
                        ? `/profile/teacher/${profile.id}`
                        : getDashboardPath(role),
                  )
                }
              >
                {role === 'student' || role === 'teacher' ? 'View Public Profile' : 'View Dashboard'}
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => exportAccountData({ profile, preferences: preferencesForm, extras })}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <nav className="flex min-w-max border-b border-slate-200 dark:border-slate-800">
            {([
              ['personal', 'Personal Info'],
              ['security', 'Security'],
              ['billing', 'Billing'],
              ['notifications', 'Notifications'],
            ] as Array<[AccountTab, string]>).map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-b-2 border-[#1152d4] text-[#1152d4]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {activeTab === 'personal' ? (
              <>
                <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-6 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><User className="h-5 w-5 text-[#1152d4]" /> Basic Details</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div><Label>First Name</Label><Input value={profileForm.firstName} onChange={(e) => setProfileForm((c) => ({ ...c, firstName: e.target.value }))} className="mt-2 rounded-xl" /></div>
                    <div><Label>Last Name</Label><Input value={profileForm.lastName} onChange={(e) => setProfileForm((c) => ({ ...c, lastName: e.target.value }))} className="mt-2 rounded-xl" /></div>
                    <div className="md:col-span-2"><Label>Email Address</Label><Input value={profile.email} disabled className="mt-2 rounded-xl" /></div>
                    <div className="md:col-span-2"><Label>Date de naissance</Label><Input type="date" value={profileForm.dateNaissance} onChange={(e) => setProfileForm((c) => ({ ...c, dateNaissance: e.target.value }))} className="mt-2 rounded-xl" /></div>
                    <div className="md:col-span-2"><Label>Bio</Label><Textarea value={extras.bio} onChange={(e) => setExtras((c) => ({ ...c, bio: e.target.value }))} rows={4} className="mt-2 rounded-xl" /><p className="mt-2 text-xs text-slate-400">Ce champ est conserve localement sur cet appareil en attendant un champ backend dedie.</p></div>
                  </div>
                </CardContent></Card>

                <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-4 p-6">
                  <h3 className="text-lg font-bold">Social Connections</h3>
                  <div><Label>Twitter / X</Label><Input value={extras.twitter} onChange={(e) => setExtras((c) => ({ ...c, twitter: e.target.value }))} placeholder="@username" className="mt-2 rounded-xl" /></div>
                  <div><Label>LinkedIn</Label><Input value={extras.linkedIn} onChange={(e) => setExtras((c) => ({ ...c, linkedIn: e.target.value }))} placeholder="linkedin.com/in/username" className="mt-2 rounded-xl" /></div>
                  <div><Label>Personal Website</Label><Input value={extras.website} onChange={(e) => setExtras((c) => ({ ...c, website: e.target.value }))} placeholder="https://your-site.com" className="mt-2 rounded-xl" /></div>
                  <div><Label>Location</Label><Input value={extras.location} onChange={(e) => setExtras((c) => ({ ...c, location: e.target.value }))} placeholder="City, Country" className="mt-2 rounded-xl" /></div>
                </CardContent></Card>
              </>
            ) : null}

            {activeTab === 'security' ? (
              <>
                <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-5 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><Shield className="h-5 w-5 text-[#1152d4]" /> Account Security</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Email</p><p className="mt-2 font-semibold">{profile.email}</p></div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Role</p><p className="mt-2 font-semibold">{getUserRoleLabel(profile.role)}</p></div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">La gestion du mot de passe et des sessions actives sera branchee des que l endpoint dedie sera expose. Pour le moment, utilise la page de reinitialisation si necessaire.</div>
                </CardContent></Card>

                <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-6 p-6">
                  <h3 className="text-lg font-bold">Experience & Interface</h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div><Label>Theme</Label><Select value={preferencesForm.theme} onValueChange={(value) => setPreferencesForm((c) => (c ? { ...c, theme: value as UserPreferences['theme'] } : c))}><SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Clair</SelectItem><SelectItem value="dark">Sombre</SelectItem><SelectItem value="system">Systeme</SelectItem></SelectContent></Select></div>
                    <div><Label>Language</Label><Select value={preferencesForm.language} onValueChange={(value) => setPreferencesForm((c) => (c ? { ...c, language: value as UserPreferences['language'] } : c))}><SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fr">Francais</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>
                    <div><Label>Timezone</Label><Input value={preferencesForm.timezone} onChange={(e) => setPreferencesForm((c) => (c ? { ...c, timezone: e.target.value } : c))} className="mt-2 rounded-xl" /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-2xl border p-4"><div><p className="font-medium">Autoplay</p><p className="text-xs text-slate-500">Lancer la video automatiquement</p></div><Switch checked={preferencesForm.autoplay} onCheckedChange={(checked) => setPreferencesForm((c) => (c ? { ...c, autoplay: checked } : c))} /></div>
                    <div className="flex items-center justify-between rounded-2xl border p-4"><div><p className="font-medium">Subtitles</p><p className="text-xs text-slate-500">Activer les sous-titres</p></div><Switch checked={preferencesForm.subtitles} onCheckedChange={(checked) => setPreferencesForm((c) => (c ? { ...c, subtitles: checked } : c))} /></div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div><Label>Streaming quality</Label><Select value={preferencesForm.quality} onValueChange={(value) => setPreferencesForm((c) => (c ? { ...c, quality: value as UserPreferences['quality'] } : c))}><SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Auto</SelectItem><SelectItem value="720p">720p</SelectItem><SelectItem value="1080p">1080p</SelectItem><SelectItem value="4K">4K</SelectItem></SelectContent></Select></div>
                    <div><Label>Download quality</Label><Select value={preferencesForm.downloadQuality} onValueChange={(value) => setPreferencesForm((c) => (c ? { ...c, downloadQuality: value as UserPreferences['downloadQuality'] } : c))}><SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                  </div>
                  <div><Label>Playback speed: {preferencesForm.playbackSpeed.toFixed(2)}x</Label><Slider className="mt-4" value={[preferencesForm.playbackSpeed]} min={0.5} max={2} step={0.25} onValueChange={(value) => setPreferencesForm((c) => (c ? { ...c, playbackSpeed: value[0] } : c))} /></div>
                </CardContent></Card>
              </>
            ) : null}

            {activeTab === 'billing' ? (
              <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-6 p-6">
                <h3 className="text-lg font-bold">Billing & Data</h3>
                <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-5">
                  <p className="text-sm font-bold text-[#1152d4]">Current account</p>
                  <p className="mt-2 text-2xl font-black">{getUserRoleLabel(profile.role)}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">La facturation n est pas encore exposee par le backend. Les actions ci-dessous restent disponibles pour la portabilite de vos donnees.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button className="rounded-xl bg-[#1152d4] text-white hover:bg-[#0f47b9]" onClick={() => exportAccountData({ profile, preferences: preferencesForm, extras })}><Download className="mr-2 h-4 w-4" /> Export complete data</Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => onNavigate('/help')}>Contact support</Button>
                </div>
              </CardContent></Card>
            ) : null}

            {activeTab === 'notifications' ? (
              <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-4 p-6">
                <h3 className="text-lg font-bold">Notifications</h3>
                {[
                  ['emailNotifications', 'Email notifications', 'Recevoir les notifications par email'],
                  ['pushNotifications', 'Push notifications', 'Recevoir les notifications navigateur'],
                  ['marketingEmails', 'Marketing emails', 'Recevoir les annonces produit'],
                  ['courseReminders', 'Course reminders', 'Rappels avant vos cours et sessions live'],
                  ['weeklyDigest', 'Weekly digest', 'Resume hebdomadaire de votre activite'],
                  ['allowCourseRecommendations', 'Recommendations', 'Autoriser les recommandations personnalisees'],
                ].map(([key, title, desc]) => (
                  <div key={key} className="flex items-center justify-between rounded-2xl border p-4">
                    <div><p className="font-medium">{title}</p><p className="text-xs text-slate-500">{desc}</p></div>
                    <Switch checked={Boolean(preferencesForm[key as keyof UserPreferences])} onCheckedChange={(checked) => setPreferencesForm((c) => (c ? { ...c, [key]: checked } : c))} />
                  </div>
                ))}
              </CardContent></Card>
            ) : null}

            <div className="flex justify-end gap-4 pb-8">
              <Button variant="outline" className="rounded-xl" onClick={handleReset} disabled={!hasChanges || isSaving}>Cancel</Button>
              <Button className="rounded-xl bg-[#1152d4] text-white hover:bg-[#0f47b9]" onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[24px] border-[#1152d4]/20 bg-[#1152d4]/5"><CardContent className="p-6">
              <h4 className="mb-4 font-bold text-[#1152d4]">Profile Strength</h4>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/80 dark:bg-slate-800"><div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${profileStrength}%` }} /></div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Votre profil est complete a {profileStrength}%. Ajoutez une localisation et au moins un lien externe pour le renforcer.</p>
            </CardContent></Card>

            <Card className="rounded-[24px] border-slate-200 dark:border-slate-800"><CardContent className="space-y-4 p-6">
              <h4 className="font-bold">Privacy</h4>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Public Profile</p><p className="text-xs text-slate-500">Allow users to find you</p></div><Switch checked={preferencesForm.allowProfileViews} onCheckedChange={(checked) => setPreferencesForm((c) => (c ? { ...c, allowProfileViews: checked } : c))} /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Show Activity</p><p className="text-xs text-slate-500">Share what you're up to</p></div><Switch checked={preferencesForm.showOnlineStatus} onCheckedChange={(checked) => setPreferencesForm((c) => (c ? { ...c, showOnlineStatus: checked } : c))} /></div>
            </CardContent></Card>

            <Card className="overflow-hidden rounded-[24px] border-slate-900 bg-slate-900 text-white"><CardContent className="relative p-6">
              <div className="relative z-10">
                <h4 className="font-bold">Need Help?</h4>
                <p className="mt-2 text-xs text-slate-400">Notre equipe support peut vous aider sur le profil, les preferences et la configuration de votre compte.</p>
                <Button className="mt-4 w-full rounded-xl bg-white text-slate-900 hover:bg-slate-100" onClick={() => onNavigate('/help')}>Contact Support</Button>
              </div>
            </CardContent></Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2024 EduFlow Account Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <button type="button" onClick={() => onNavigate('/privacy')} className="transition-colors hover:text-[#1152d4]">Privacy Policy</button>
            <button type="button" onClick={() => onNavigate('/terms')} className="transition-colors hover:text-[#1152d4]">Terms of Service</button>
            <button type="button" onClick={() => onNavigate('/help')} className="transition-colors hover:text-[#1152d4]">Help Center</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
