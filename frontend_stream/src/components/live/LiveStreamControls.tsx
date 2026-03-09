import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorSpeaker, 
  Monitor,
  Settings,
  Wifi,
  WifiOff,
  Volume2,
  Camera,
  RotateCcw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../ui/dropdown-menu';

interface StreamDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface StreamSettings {
  videoDevice: string;
  audioDevice: string;
  quality: '720p' | '1080p' | '4K';
  bitrate: number;
  frameRate: number;
  enableEchoCancellation: boolean;
  enableNoiseSuppression: boolean;
  enableAutoGainControl: boolean;
}

interface ConnectionStats {
  bitrate: number;
  fps: number;
  resolution: string;
  latency: number;
  packetsLost: number;
  quality: 'excellent' | 'good' | 'poor';
}

interface LiveStreamControlsProps {
  isStreaming: boolean;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isSharingScreen: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onShareScreen: () => void;
  onStartStream: () => void;
  onStopStream: () => void;
}

export function LiveStreamControls({
  isStreaming,
  isVideoOn,
  isAudioOn,
  isSharingScreen,
  onToggleVideo,
  onToggleAudio,
  onShareScreen,
  onStartStream,
  onStopStream
}: LiveStreamControlsProps) {
  // Device state
  const [devices, setDevices] = useState<StreamDevice[]>([]);
  const [settings, setSettings] = useState<StreamSettings>({
    videoDevice: '',
    audioDevice: '',
    quality: '1080p',
    bitrate: 2500,
    frameRate: 30,
    enableEchoCancellation: true,
    enableNoiseSuppression: true,
    enableAutoGainControl: true
  });
  
  // Connection stats
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    bitrate: 2500,
    fps: 30,
    resolution: '1920x1080',
    latency: 45,
    packetsLost: 0,
    quality: 'excellent'
  });
  
  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  
  // Load available devices
  useEffect(() => {
    loadDevices();
  }, []);
  
  const loadDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const streamDevices: StreamDevice[] = deviceList
        .filter(device => device.kind === 'videoinput' || device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `${device.kind === 'videoinput' ? 'Camera' : 'Microphone'} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      
      setDevices(streamDevices);
      
      // Set default devices
      const defaultVideo = streamDevices.find(d => d.kind === 'videoinput');
      const defaultAudio = streamDevices.find(d => d.kind === 'audioinput');
      
      if (defaultVideo || defaultAudio) {
        setSettings(prev => ({
          ...prev,
          videoDevice: defaultVideo?.deviceId || '',
          audioDevice: defaultAudio?.deviceId || ''
        }));
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };
  
  const testConnection = async () => {
    setIsTestingConnection(true);
    
    // Simulate connection test
    setTimeout(() => {
      setConnectionStats(prev => ({
        ...prev,
        latency: Math.floor(Math.random() * 100) + 20,
        quality: Math.random() > 0.3 ? 'excellent' : Math.random() > 0.6 ? 'good' : 'poor'
      }));
      setIsTestingConnection(false);
    }, 2000);
  };
  
  const resetToDefaults = () => {
    setSettings({
      videoDevice: devices.find(d => d.kind === 'videoinput')?.deviceId || '',
      audioDevice: devices.find(d => d.kind === 'audioinput')?.deviceId || '',
      quality: '1080p',
      bitrate: 2500,
      frameRate: 30,
      enableEchoCancellation: true,
      enableNoiseSuppression: true,
      enableAutoGainControl: true
    });
  };
  
  const getQualitySettings = (quality: string) => {
    switch (quality) {
      case '720p':
        return { width: 1280, height: 720, bitrate: 1500 };
      case '1080p':
        return { width: 1920, height: 1080, bitrate: 2500 };
      case '4K':
        return { width: 3840, height: 2160, bitrate: 8000 };
      default:
        return { width: 1920, height: 1080, bitrate: 2500 };
    }
  };
  
  const getConnectionStatusColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Contrôles de diffusion
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStats.quality === 'excellent' ? 'bg-green-500' :
                connectionStats.quality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
              } ${isStreaming ? 'animate-pulse' : ''}`} />
              <span className={`text-sm ${getConnectionStatusColor(connectionStats.quality)}`}>
                {connectionStats.quality === 'excellent' ? 'Excellent' :
                 connectionStats.quality === 'good' ? 'Bon' : 'Faible'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg"
              variant={isStreaming ? "destructive" : "default"}
              onClick={isStreaming ? onStopStream : onStartStream}
              className="px-8"
            >
              {isStreaming ? (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Arrêter le live
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Démarrer le live
                </>
              )}
            </Button>
          </div>
          
          {/* Media controls */}
          <div className="flex items-center justify-center space-x-2">
            <Button 
              variant={isVideoOn ? "default" : "destructive"}
              onClick={onToggleVideo}
              size="lg"
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            
            <Button 
              variant={isAudioOn ? "default" : "destructive"}
              onClick={onToggleAudio}
              size="lg"
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            
            <Button 
              variant={isSharingScreen ? "secondary" : "outline"}
              onClick={onShareScreen}
              size="lg"
            >
              {isSharingScreen ? <MonitorSpeaker className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Options avancées</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres détaillés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={testConnection}>
                  <Activity className="w-4 h-4 mr-2" />
                  Tester la connexion
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetToDefaults}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      {/* Connection Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Statistiques de connexion
            {isTestingConnection && <Zap className="w-4 h-4 ml-2 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{connectionStats.bitrate}</div>
              <div className="text-xs text-muted-foreground">kbps</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{connectionStats.fps}</div>
              <div className="text-xs text-muted-foreground">fps</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{connectionStats.latency}ms</div>
              <div className="text-xs text-muted-foreground">latence</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{connectionStats.packetsLost}</div>
              <div className="text-xs text-muted-foreground">paquets perdus</div>
            </div>
          </div>
          
          {connectionStats.quality === 'poor' && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Qualité de connexion faible. Considérez réduire la qualité vidéo.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paramètres avancés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Périphériques</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Caméra</label>
                  <Select 
                    value={settings.videoDevice} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, videoDevice: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une caméra" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.filter(d => d.kind === 'videoinput').map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Microphone</label>
                  <Select 
                    value={settings.audioDevice} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, audioDevice: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.filter(d => d.kind === 'audioinput').map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Quality Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Qualité vidéo</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Résolution</label>
                  <Select 
                    value={settings.quality} 
                    onValueChange={(value: any) => {
                      const qualitySettings = getQualitySettings(value);
                      setSettings(prev => ({ 
                        ...prev, 
                        quality: value,
                        bitrate: qualitySettings.bitrate
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Débit ({settings.bitrate} kbps)</label>
                  <Slider
                    value={[settings.bitrate]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, bitrate: value }))}
                    max={8000}
                    min={500}
                    step={100}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">FPS ({settings.frameRate})</label>
                  <Slider
                    value={[settings.frameRate]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, frameRate: value }))}
                    max={60}
                    min={15}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            
            {/* Audio Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Paramètres audio</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Annulation d'écho</span>
                  <Switch
                    checked={settings.enableEchoCancellation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableEchoCancellation: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Suppression du bruit</span>
                  <Switch
                    checked={settings.enableNoiseSuppression}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNoiseSuppression: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contrôle automatique du gain</span>
                  <Switch
                    checked={settings.enableAutoGainControl}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAutoGainControl: checked }))}
                  />
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              <Button onClick={testConnection} disabled={isTestingConnection}>
                {isTestingConnection ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tester la connexion
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}