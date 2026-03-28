import { Bell, Download, Globe, Monitor, Settings, Shield } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Separator } from '../../../ui/separator';
import type { UserPreferences } from '../../../../types/user';
import { InfoCard } from './InfoCard';

interface SettingsAccountTabProps {
  userEmail: string;
  localPreferences: UserPreferences;
  handleExportData: () => void;
}

export function SettingsAccountTab({
  userEmail,
  localPreferences,
  handleExportData,
}: SettingsAccountTabProps) {
  return (
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
          <InfoCard
            icon={Bell}
            label="Push"
            value={localPreferences.pushNotifications ? 'Active' : 'Inactive'}
          />
          <InfoCard icon={Shield} label="Profil" value={userEmail} />
        </div>
        <Separator />
        <Button variant="outline" onClick={handleExportData}>
          <Download className="mr-2 h-4 w-4" />
          Exporter mes parametres
        </Button>
      </CardContent>
    </Card>
  );
}
