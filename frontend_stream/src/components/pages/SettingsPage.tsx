import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Settings, 
  Bell, 
  Eye, 
  Volume2, 
  Monitor, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Download, 
  Trash, 
  AlertTriangle,
  Check,
  X,
  Info
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { t, setLanguage, getCurrentLanguage } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('general');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newCourses: true,
    liveSessions: true,
    messages: false,
    newsletter: false,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    progressVisible: false,
    emailVisible: false,
    analyticsTracking: true,
    dataSharing: false
  });
  const [videoSettings, setVideoSettings] = useState({
    autoplay: true,
    quality: 'auto',
    subtitles: true,
    volume: [75],
    playbackSpeed: '1.0'
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const handleVideoSettingChange = (key: string, value: any) => {
    setVideoSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
    // Implémenter l'export des données
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    // Implémenter la suppression du compte
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">{t('common.settings')}</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          <TabsTrigger value="video">Lecture vidéo</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Thème</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choisissez votre thème préféré
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('light')}
                    className="justify-start"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Clair
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('dark')}
                    className="justify-start"
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Sombre
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Langue</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Sélectionnez votre langue préférée
                </p>
                <Select value={getCurrentLanguage()} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[200px]">
                    <Globe className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Fuseau horaire</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Utilisé pour afficher les dates et heures des cours
                </p>
                <Select defaultValue="europe/paris">
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/paris">Europe/Paris (GMT+1)</SelectItem>
                    <SelectItem value="america/new_york">America/New_York (GMT-5)</SelectItem>
                    <SelectItem value="asia/tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    <SelectItem value="america/los_angeles">America/Los_Angeles (GMT-8)</SelectItem>
                    <SelectItem value="europe/london">Europe/London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interface Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Préférences d'interface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Animation d'interface</Label>
                  <p className="text-sm text-muted-foreground">Activer les animations et transitions</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Barre latérale compacte</Label>
                  <p className="text-sm text-muted-foreground">Utiliser une navigation plus compacte</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Suggestions automatiques</Label>
                  <p className="text-sm text-muted-foreground">Afficher des suggestions de cours basées sur vos préférences</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Types de notifications</Label>
                <div className="space-y-4 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-muted-foreground">Recevoir des notifications importantes par email</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Contenu des notifications</Label>
                <div className="space-y-4 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux cours</p>
                      <p className="text-sm text-muted-foreground">Notifications pour les nouveaux cours publiés</p>
                    </div>
                    <Switch 
                      checked={notifications.newCourses}
                      onCheckedChange={(checked) => handleNotificationChange('newCourses', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sessions live</p>
                      <p className="text-sm text-muted-foreground">Rappels pour les sessions en direct</p>
                    </div>
                    <Switch 
                      checked={notifications.liveSessions}
                      onCheckedChange={(checked) => handleNotificationChange('liveSessions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Messages</p>
                      <p className="text-sm text-muted-foreground">Messages des enseignants et administrateurs</p>
                    </div>
                    <Switch 
                      checked={notifications.messages}
                      onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Newsletter</p>
                      <p className="text-sm text-muted-foreground">Newsletter hebdomadaire avec les actualités</p>
                    </div>
                    <Switch 
                      checked={notifications.newsletter}
                      onCheckedChange={(checked) => handleNotificationChange('newsletter', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotions</p>
                      <p className="text-sm text-muted-foreground">Offres spéciales et promotions</p>
                    </div>
                    <Switch 
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Confidentialité
              </CardTitle>
              <CardDescription>
                Contrôlez vos paramètres de confidentialité et données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Visibilité du profil</Label>
                <div className="space-y-4 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profil public</p>
                      <p className="text-sm text-muted-foreground">Permettre aux autres utilisateurs de voir votre profil</p>
                    </div>
                    <Switch 
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Progrès visible</p>
                      <p className="text-sm text-muted-foreground">Afficher vos progrès de cours aux autres</p>
                    </div>
                    <Switch 
                      checked={privacy.progressVisible}
                      onCheckedChange={(checked) => handlePrivacyChange('progressVisible', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email visible</p>
                      <p className="text-sm text-muted-foreground">Permettre aux enseignants de voir votre email</p>
                    </div>
                    <Switch 
                      checked={privacy.emailVisible}
                      onCheckedChange={(checked) => handlePrivacyChange('emailVisible', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Collecte de données</Label>
                <div className="space-y-4 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Suivi analytique</p>
                      <p className="text-sm text-muted-foreground">Permettre le suivi pour améliorer l'expérience</p>
                    </div>
                    <Switch 
                      checked={privacy.analyticsTracking}
                      onCheckedChange={(checked) => handlePrivacyChange('analyticsTracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Partage de données</p>
                      <p className="text-sm text-muted-foreground">Partager des données anonymisées avec des partenaires</p>
                    </div>
                    <Switch 
                      checked={privacy.dataSharing}
                      onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Vos données personnelles sont protégées selon le RGPD. Vous pouvez à tout moment demander l'export ou la suppression de vos données.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Paramètres de lecture vidéo
              </CardTitle>
              <CardDescription>
                Configurez vos préférences pour la lecture des cours vidéo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Lecture automatique</Label>
                  <p className="text-sm text-muted-foreground">Démarrer automatiquement la lecture des vidéos</p>
                </div>
                <Switch 
                  checked={videoSettings.autoplay}
                  onCheckedChange={(checked) => handleVideoSettingChange('autoplay', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Sous-titres automatiques</Label>
                  <p className="text-sm text-muted-foreground">Activer les sous-titres par défaut</p>
                </div>
                <Switch 
                  checked={videoSettings.subtitles}
                  onCheckedChange={(checked) => handleVideoSettingChange('subtitles', checked)}
                />
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Qualité vidéo par défaut</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choisissez la qualité de lecture par défaut
                </p>
                <Select 
                  value={videoSettings.quality} 
                  onValueChange={(value) => handleVideoSettingChange('quality', value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatique</SelectItem>
                    <SelectItem value="1080p">1080p (HD)</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="360p">360p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Vitesse de lecture par défaut</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Vitesse de lecture préférée pour les cours
                </p>
                <Select 
                  value={videoSettings.playbackSpeed} 
                  onValueChange={(value) => handleVideoSettingChange('playbackSpeed', value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1.0">1x (Normal)</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2.0">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Volume par défaut</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Volume: {videoSettings.volume[0]}%
                </p>
                <Slider
                  value={videoSettings.volume}
                  onValueChange={(value) => handleVideoSettingChange('volume', value)}
                  max={100}
                  step={5}
                  className="w-[300px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du compte</CardTitle>
              <CardDescription>
                Gérez vos données et votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Exportation des données</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Téléchargez une copie de toutes vos données
                </p>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter mes données
                </Button>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Suppression du compte</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Supprimer définitivement votre compte et toutes vos données
                </p>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Attention :</strong> Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleDeleteAccount} 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID du compte</p>
                  <p className="font-mono">user_1234567890</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de création</p>
                  <p>15 septembre 2023</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dernière connexion</p>
                  <p>Aujourd'hui à 14:30</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version des conditions</p>
                  <p>v2.1 (acceptée le 15/09/2023)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}