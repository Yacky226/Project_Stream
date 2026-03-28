import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import type { UserPreferences } from '../../../../types/user';
import { SettingSwitch } from './SettingSwitch';

interface SettingsPrivacyTabProps {
  localPreferences: UserPreferences;
  handlePartialUpdate: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export function SettingsPrivacyTab({ localPreferences, handlePartialUpdate }: SettingsPrivacyTabProps) {
  return (
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
          onCheckedChange={(checked) => handlePartialUpdate('allowCourseRecommendations', checked)}
        />
      </CardContent>
    </Card>
  );
}
