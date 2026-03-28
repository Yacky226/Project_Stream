import { Download, Loader2, Shield, User } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Slider } from '../../../ui/slider';
import { Switch } from '../../../ui/switch';
import { Textarea } from '../../../ui/textarea';
import type { UserPreferences } from '../../../../types/user';
import type { AccountHubDataModel } from '../useAccountHubData';

interface AccountHubTabPanelsProps {
  model: AccountHubDataModel;
  onNavigate: (path: string | number) => void;
}

const NOTIFICATION_SWITCHES: Array<{
  key: keyof UserPreferences;
  title: string;
  description: string;
}> = [
  {
    key: 'emailNotifications',
    title: 'Email notifications',
    description: 'Recevoir les notifications par email',
  },
  {
    key: 'pushNotifications',
    title: 'Push notifications',
    description: 'Recevoir les notifications navigateur',
  },
  {
    key: 'marketingEmails',
    title: 'Marketing emails',
    description: 'Recevoir les annonces produit',
  },
  {
    key: 'courseReminders',
    title: 'Course reminders',
    description: 'Rappels avant vos cours et sessions live',
  },
  {
    key: 'weeklyDigest',
    title: 'Weekly digest',
    description: 'Resume hebdomadaire de votre activite',
  },
  {
    key: 'allowCourseRecommendations',
    title: 'Recommendations',
    description: 'Autoriser les recommandations personnalisees',
  },
];

function PersonalTab({ model }: { model: AccountHubDataModel }) {
  if (!model.profile) {
    return null;
  }

  return (
    <>
      <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-6 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <User className="h-5 w-5 text-[#1152d4]" />
            Basic Details
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input
                value={model.profileForm.firstName}
                onChange={(event) => model.updateProfileField('firstName', event.target.value)}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={model.profileForm.lastName}
                onChange={(event) => model.updateProfileField('lastName', event.target.value)}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Email Address</Label>
              <Input value={model.profile.email} disabled className="mt-2 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Label>Date de naissance</Label>
              <Input
                type="date"
                value={model.profileForm.dateNaissance}
                onChange={(event) => model.updateProfileField('dateNaissance', event.target.value)}
                className="mt-2 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Bio</Label>
              <Textarea
                value={model.extras.bio}
                onChange={(event) => model.updateExtraField('bio', event.target.value)}
                rows={4}
                className="mt-2 rounded-xl"
              />
              <p className="mt-2 text-xs text-slate-400">
                Ce champ est conserve localement sur cet appareil en attendant un champ backend dedie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-lg font-bold">Social Connections</h3>
          <div>
            <Label>Twitter / X</Label>
            <Input
              value={model.extras.twitter}
              onChange={(event) => model.updateExtraField('twitter', event.target.value)}
              placeholder="@username"
              className="mt-2 rounded-xl"
            />
          </div>
          <div>
            <Label>LinkedIn</Label>
            <Input
              value={model.extras.linkedIn}
              onChange={(event) => model.updateExtraField('linkedIn', event.target.value)}
              placeholder="linkedin.com/in/username"
              className="mt-2 rounded-xl"
            />
          </div>
          <div>
            <Label>Personal Website</Label>
            <Input
              value={model.extras.website}
              onChange={(event) => model.updateExtraField('website', event.target.value)}
              placeholder="https://your-site.com"
              className="mt-2 rounded-xl"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={model.extras.location}
              onChange={(event) => model.updateExtraField('location', event.target.value)}
              placeholder="City, Country"
              className="mt-2 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SecurityTab({ model }: { model: AccountHubDataModel }) {
  if (!model.preferencesForm || !model.profile) {
    return null;
  }

  return (
    <>
      <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Shield className="h-5 w-5 text-[#1152d4]" />
            Account Security
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Email</p>
              <p className="mt-2 font-semibold">{model.profile.email}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Role</p>
              <p className="mt-2 font-semibold">{model.getRoleLabel()}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            La gestion du mot de passe et des sessions actives sera branchee des que l endpoint dedie
            sera expose. Pour le moment, utilise la page de reinitialisation si necessaire.
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-6 p-6">
          <h3 className="text-lg font-bold">Experience & Interface</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Label>Theme</Label>
              <Select
                value={model.preferencesForm.theme}
                onValueChange={(value) =>
                  model.updatePreferenceField('theme', value as UserPreferences['theme'])
                }
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Systeme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select
                value={model.preferencesForm.language}
                onValueChange={(value) =>
                  model.updatePreferenceField('language', value as UserPreferences['language'])
                }
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Francais</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timezone</Label>
              <Input
                value={model.preferencesForm.timezone}
                onChange={(event) => model.updatePreferenceField('timezone', event.target.value)}
                className="mt-2 rounded-xl"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Autoplay</p>
                <p className="text-xs text-slate-500">Lancer la video automatiquement</p>
              </div>
              <Switch
                checked={model.preferencesForm.autoplay}
                onCheckedChange={(checked) => model.updatePreferenceField('autoplay', checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Subtitles</p>
                <p className="text-xs text-slate-500">Activer les sous-titres</p>
              </div>
              <Switch
                checked={model.preferencesForm.subtitles}
                onCheckedChange={(checked) => model.updatePreferenceField('subtitles', checked)}
              />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label>Streaming quality</Label>
              <Select
                value={model.preferencesForm.quality}
                onValueChange={(value) =>
                  model.updatePreferenceField('quality', value as UserPreferences['quality'])
                }
              >
                <SelectTrigger className="mt-2 rounded-xl">
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
            <div>
              <Label>Download quality</Label>
              <Select
                value={model.preferencesForm.downloadQuality}
                onValueChange={(value) =>
                  model.updatePreferenceField(
                    'downloadQuality',
                    value as UserPreferences['downloadQuality'],
                  )
                }
              >
                <SelectTrigger className="mt-2 rounded-xl">
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
          <div>
            <Label>Playback speed: {model.preferencesForm.playbackSpeed.toFixed(2)}x</Label>
            <Slider
              className="mt-4"
              value={[model.preferencesForm.playbackSpeed]}
              min={0.5}
              max={2}
              step={0.25}
              onValueChange={(value) => model.updatePreferenceField('playbackSpeed', value[0])}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function BillingTab({
  model,
  onNavigate,
}: {
  model: AccountHubDataModel;
  onNavigate: (path: string | number) => void;
}) {
  if (!model.profile) {
    return null;
  }

  return (
    <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
      <CardContent className="space-y-6 p-6">
        <h3 className="text-lg font-bold">Billing & Data</h3>
        <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-5">
          <p className="text-sm font-bold text-[#1152d4]">Current account</p>
          <p className="mt-2 text-2xl font-black">{model.getRoleLabel()}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            La facturation n est pas encore exposee par le backend. Les actions ci-dessous restent
            disponibles pour la portabilite de vos donnees.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Button
            className="rounded-xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
            onClick={model.handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export complete data
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => onNavigate('/help')}>
            Contact support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab({ model }: { model: AccountHubDataModel }) {
  if (!model.preferencesForm) {
    return null;
  }

  return (
    <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-bold">Notifications</h3>
        {NOTIFICATION_SWITCHES.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
            <Switch
              checked={Boolean(model.preferencesForm?.[item.key])}
              onCheckedChange={(checked) => model.updatePreferenceField(item.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AccountHubTabPanels({ model, onNavigate }: AccountHubTabPanelsProps) {
  return (
    <>
      {model.activeTab === 'personal' ? <PersonalTab model={model} /> : null}
      {model.activeTab === 'security' ? <SecurityTab model={model} /> : null}
      {model.activeTab === 'billing' ? (
        <BillingTab model={model} onNavigate={onNavigate} />
      ) : null}
      {model.activeTab === 'notifications' ? <NotificationsTab model={model} /> : null}

      <div className="flex justify-end gap-4 pb-8">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={model.handleReset}
          disabled={!model.hasChanges || model.isSaving}
        >
          Cancel
        </Button>
        <Button
          className="rounded-xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
          onClick={() => void model.handleSave()}
          disabled={!model.hasChanges || model.isSaving}
        >
          {model.isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </>
  );
}
