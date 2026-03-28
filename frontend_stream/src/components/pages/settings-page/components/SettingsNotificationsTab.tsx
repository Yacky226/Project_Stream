import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import type { UserPreferences } from '../../../../types/user';
import { SettingSwitch } from './SettingSwitch';

interface SettingsNotificationsTabProps {
  localPreferences: UserPreferences;
  handlePartialUpdate: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export function SettingsNotificationsTab({
  localPreferences,
  handlePartialUpdate,
}: SettingsNotificationsTabProps) {
  return (
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
  );
}
