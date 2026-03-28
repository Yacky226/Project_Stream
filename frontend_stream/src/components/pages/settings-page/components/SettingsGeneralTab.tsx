import { Monitor, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Separator } from '../../../ui/separator';
import { Slider } from '../../../ui/slider';
import { Switch } from '../../../ui/switch';
import type { UserPreferences } from '../../../../types/user';

interface SettingsGeneralTabProps {
  localPreferences: UserPreferences;
  handlePartialUpdate: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export function SettingsGeneralTab({ localPreferences, handlePartialUpdate }: SettingsGeneralTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Apparence et langue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={localPreferences.theme}
                onValueChange={(value) => handlePartialUpdate('theme', value as UserPreferences['theme'])}
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
                  handlePartialUpdate(
                    'downloadQuality',
                    value as UserPreferences['downloadQuality'],
                  )
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
            <Label>Vitesse de lecture: {localPreferences.playbackSpeed.toFixed(2)}x</Label>
            <Slider
              value={[localPreferences.playbackSpeed]}
              min={0.5}
              max={2}
              step={0.25}
              onValueChange={(value) => {
                if (value.length > 0) {
                  handlePartialUpdate('playbackSpeed', value[0]);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
