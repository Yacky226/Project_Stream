import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Play,
  Square,
  Users,
  MessageSquare,
  Settings,
  Camera,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Share2,
  Download,
  Trash2
} from 'lucide-react';
// import { useAuth } from '../../lib/auth';

interface LiveStreamingStudioProps {
  courseId: string;
  sessionId?: string;
  onNavigate: (path: string) => void;
}

interface StreamSettings {
  title: string;
  description: string;
  isPrivate: boolean;
  allowChat: boolean;
  allowQA: boolean;
  recordSession: boolean;
  quality: 'HD' | 'FHD' | '4K';
  maxViewers: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isQuestion: boolean;
}

interface StreamStats {
  viewers: number;
  duration: number;
  bitrate: number;
  fps: number;
  resolution: string;
  chatMessages: number;
}

export function LiveStreamingStudio({ courseId, sessionId, onNavigate }: LiveStreamingStudioProps) {
  // const { getCurrentUser } = useAuth();
  // const user = getCurrentUser();
  const user = { id: 'teacher-1', name: 'Enseignant', token: 'mock-token' };
  
  // Refs for media elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Media state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  
  // Stream settings
  const [settings, setSettings] = useState<StreamSettings>({
    title: 'Session Live - React Avancé',
    description: 'Masterclass sur les hooks React avancés et les patterns d\'optimisation',
    isPrivate: false,
    allowChat: true,
    allowQA: true,
    recordSession: true,
    quality: 'HD',
    maxViewers: 100
  });
  
  // Chat and interaction
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user1',
      username: 'Marie Dupont',
      message: 'Bonjour ! J\'ai hâte de commencer cette session',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isQuestion: false
    },
    {
      id: '2',
      userId: 'user2', 
      username: 'Pierre Martin',
      message: 'Est-ce que vous pourrez expliquer useCallback vs useMemo ?',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isQuestion: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Stream statistics
  const [stats, setStats] = useState<StreamStats>({
    viewers: 0,
    duration: 0,
    bitrate: 0,
    fps: 0,
    resolution: '1920x1080',
    chatMessages: 2
  });
  
  // WebRTC and streaming setup
  const setupWebRTC = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      // Simulate WebRTC connection for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnectionStatus('connected');
      setIsConnecting(false);
      
      return null;
    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      setConnectionStatus('error');
      setIsConnecting(false);
      throw error;
    }
  };
  
  const startStreaming = async () => {
    try {
      if (!stream) {
        await setupWebRTC();
      }
      
      setIsStreaming(true);
      
      // Simulate successful streaming start
      console.log('Streaming started for course:', courseId);
    } catch (error) {
      console.error('Error starting stream:', error);
      setIsStreaming(false);
    }
  };
  
  const stopStreaming = async () => {
    try {
      setIsStreaming(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      setConnectionStatus('disconnected');
      console.log('Streaming stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };
  
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };
  
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };
  
  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }
        
        setScreenSharing(true);
      } else {
        // Return to camera
        await setupWebRTC();
        setScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };
  
  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.id || 'teacher',
        username: user?.name || 'Enseignant',
        message: newMessage,
        timestamp: new Date(),
        isQuestion: false
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Send to backend
      fetch('/api/live/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(message)
      });
    }
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cleanup handled in component methods

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('/teacher/dashboard')}
            >
              ← Retour au tableau de bord
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{settings.title}</h1>
              <p className="text-muted-foreground">Studio de diffusion en direct</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className={connectionStatus === 'connected' ? 'bg-green-500' : ''}
            >
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Connecté
                </>
              ) : connectionStatus === 'connecting' ? (
                'Connexion...'
              ) : connectionStatus === 'error' ? (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Erreur
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Déconnecté
                </>
              )}
            </Badge>
            
            {isStreaming && (
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                EN DIRECT
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Studio Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Aperçu en direct</span>
                  <div className="flex items-center space-x-2">
                    {isStreaming && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        {stats.viewers} spectateurs
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {!videoEnabled && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        <VideoOff className="w-12 h-12 mx-auto mb-2" />
                        <p>Caméra désactivée</p>
                      </div>
                    </div>
                  )}
                  
                  {screenSharing && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">
                        <Monitor className="w-3 h-3 mr-1" />
                        Partage d'écran
                      </Badge>
                    </div>
                  )}
                  
                  {isStreaming && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="destructive">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </Badge>
                    </div>
                  )}
                  
                  {/* Stream overlay with stats */}
                  {isStreaming && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 rounded-lg p-3 text-white text-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4">
                            <span>Durée: {formatDuration(stats.duration)}</span>
                            <span>Qualité: {stats.resolution}</span>
                            <span>FPS: {stats.fps}</span>
                          </div>
                          <div className="flex space-x-2">
                            <span>{stats.bitrate} kbps</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <Button
                    variant={videoEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant={audioEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={toggleAudio}
                  >
                    {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant={screenSharing ? "default" : "outline"}
                    size="icon"
                    onClick={toggleScreenShare}
                  >
                    {screenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  </Button>
                  
                  <div className="w-px h-8 bg-border"></div>
                  
                  {!isStreaming ? (
                    <Button
                      onClick={startStreaming}
                      disabled={isConnecting || connectionStatus !== 'connected'}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isConnecting ? 'Connexion...' : 'Démarrer le live'}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopStreaming}
                      variant="destructive"
                      size="lg"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Arrêter le live
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stream Analytics */}
            {isStreaming && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques en temps réel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.viewers}</div>
                      <div className="text-sm text-muted-foreground">Spectateurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatDuration(stats.duration)}</div>
                      <div className="text-sm text-muted-foreground">Durée</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.bitrate}</div>
                      <div className="text-sm text-muted-foreground">kbps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.chatMessages}</div>
                      <div className="text-sm text-muted-foreground">Messages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  État de la connexion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionStatus === 'disconnected' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cliquez sur "Se connecter" pour préparer votre stream.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionStatus === 'connected' && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Connecté et prêt à diffuser en direct.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Erreur de connexion. Vérifiez vos paramètres.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionStatus === 'disconnected' && (
                  <Button 
                    onClick={setupWebRTC} 
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? 'Connexion...' : 'Se connecter'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat ({chatMessages.length})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-y-auto space-y-3 mb-4 p-2 bg-muted/30 rounded">
                  {chatMessages.map(message => (
                    <div key={message.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">{message.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className={message.isQuestion ? 'text-blue-600 font-medium' : ''}>
                        {message.isQuestion && '❓ '}{message.message}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Répondre au chat..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage} size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => window.open(`/courses/${courseId}/live`, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir comme spectateur
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager le lien
                </Button>
                
                {settings.recordSession && (
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger l'enregistrement
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}