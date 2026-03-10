import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { AlertCircle, Bell, Download, Globe, Loader2, Monitor, Save, Settings, Shield, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../lib/i18n';
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '../../store/api/userApi';
import type { UserPreferences } from '../../types/user';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface SettingsPageProps {
  onNavigate: (path: string | number) => void;
}

function applyTheme(theme: UserPreferences['theme']) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    return;
  }

  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', 'system');
}

function createPreferencesExport(preferences: UserPreferences): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      preferences,
    },
    null,
    2,
  );
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { t, setLanguage } = useTranslation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const {
    data: remotePreferences,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useGetPreferencesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updatePreferences, { isLoading: isSaving }] = useUpdatePreferencesMutation();

  const [selectedTab, setSelectedTab] = useState('general');
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
    setLanguage(remotePreferences.language);
    document.documentElement.lang = remotePreferences.language;
  }, [remotePreferences, setLanguage]);

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
      setLanguage(saved.language);
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

  if (authLoading || preferencesLoading || !localPreferences) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl">{t('common.settings')}</h1>
          <p className="text-muted-foreground">Configuration synchronisee avec les endpoints backend.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !canSave}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      {preferencesError && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Le chargement des parametres a echoue.</AlertDescription>
        </Alert>
      )}
      {submitError && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {submitSuccess && (
        <Alert className="mb-4">
          <AlertDescription>{submitSuccess}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialite</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                Apparence et langue
              </CardTitle>
              <CardDescription>Parametres globaux de votre interface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={localPreferences.theme}
                    onValueChange={(value) =>
                      handlePartialUpdate('theme', value as UserPreferences['theme'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Systeme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select
                    value={localPreferences.language}
                    onValueChange={(value) =>
                      handlePartialUpdate('language', value as UserPreferences['language'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Francais</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Select
                  value={localPreferences.timezone}
                  onValueChange={(value) => handlePartialUpdate('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="Africa/Casablanca">Africa/Casablanca</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SlidersHorizontal className="mr-2 h-5 w-5" />
                Lecture video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lecture automatique</p>
                  <p className="text-sm text-muted-foreground">Demarrer automatiquement la video.</p>
                </div>
                <Switch
                  checked={localPreferences.autoplay}
                  onCheckedChange={(checked) => handlePartialUpdate('autoplay', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sous-titres</p>
                  <p className="text-sm text-muted-foreground">Activer les sous-titres par defaut.</p>
                </div>
                <Switch
                  checked={localPreferences.subtitles}
                  onCheckedChange={(checked) => handlePartialUpdate('subtitles', checked)}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Qualite streaming</Label>
                  <Select
                    value={localPreferences.quality}
                    onValueChange={(value) =>
                      handlePartialUpdate('quality', value as UserPreferences['quality'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qualite telechargement</Label>
                  <Select
                    value={localPreferences.downloadQuality}
                    onValueChange={(value) =>
                      handlePartialUpdate('downloadQuality', value as UserPreferences['downloadQuality'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Vitesse de lecture: {localPreferences.playbackSpeed.toFixed(2)}x</Label>
                </div>
                <Slider
                  value={[localPreferences.playbackSpeed]}
                  min={0.5}
                  max={2}
                  step={0.25}
                  onValueChange={(value) => handlePartialUpdate('playbackSpeed', value[0])}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Parametres de notifications backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingSwitch
                title="Notifications email"
                description="Recevoir des notifications par email."
                checked={localPreferences.emailNotifications}
                onCheckedChange={(checked) => handlePartialUpdate('emailNotifications', checked)}
              />
              <SettingSwitch
                title="Notifications push"
                description="Recevoir des notifications web push."
                checked={localPreferences.pushNotifications}
                onCheckedChange={(checked) => handlePartialUpdate('pushNotifications', checked)}
              />
              <SettingSwitch
                title="Rappels de cours"
                description="Rappels avant les sessions/cours."
                checked={localPreferences.courseReminders}
                onCheckedChange={(checked) => handlePartialUpdate('courseReminders', checked)}
              />
              <SettingSwitch
                title="Digest hebdomadaire"
                description="Resume hebdomadaire par email."
                checked={localPreferences.weeklyDigest}
                onCheckedChange={(checked) => handlePartialUpdate('weeklyDigest', checked)}
              />
              <SettingSwitch
                title="Emails marketing"
                description="Promotions et nouveautes."
                checked={localPreferences.marketingEmails}
                onCheckedChange={(checked) => handlePartialUpdate('marketingEmails', checked)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Confidentialite
              </CardTitle>
              <CardDescription>Visibilite et recommandations personnelles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingSwitch
                title="Statut en ligne visible"
                description="Afficher votre presence en ligne."
                checked={localPreferences.showOnlineStatus}
                onCheckedChange={(checked) => handlePartialUpdate('showOnlineStatus', checked)}
              />
              <SettingSwitch
                title="Profil visible"
                description="Permettre la consultation de votre profil."
                checked={localPreferences.allowProfileViews}
                onCheckedChange={(checked) => handlePartialUpdate('allowProfileViews', checked)}
              />
              <SettingSwitch
                title="Recommandations personnalisees"
                description="Utiliser votre activite pour recommander des cours."
                checked={localPreferences.allowCourseRecommendations}
                onCheckedChange={(checked) =>
                  handlePartialUpdate('allowCourseRecommendations', checked)
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Compte
              </CardTitle>
              <CardDescription>Informations generales et export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoCard icon={Globe} label="Langue active" value={localPreferences.language.toUpperCase()} />
                <InfoCard icon={Monitor} label="Theme actif" value={localPreferences.theme} />
                <InfoCard icon={Bell} label="Push" value={localPreferences.pushNotifications ? 'Active' : 'Inactive'} />
                <InfoCard icon={Shield} label="Profil" value={user?.email || 'N/A'} />
              </div>
              <Separator />
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Exporter mes parametres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="mb-1 text-xs text-muted-foreground">
        <Icon className="mr-1 inline h-4 w-4" />
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
