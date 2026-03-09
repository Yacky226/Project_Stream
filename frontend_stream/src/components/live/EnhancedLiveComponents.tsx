/**
 * Enhanced Live Components with Streaming Service Integration
 * Ces composants utilisent le service de streaming pour l'intégration avec Spring Boot + Janus Gateway
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Square, Video, VideoOff, Mic, MicOff, Users, MessageCircle, 
  Monitor, Settings, Camera, Volume2, AlertCircle, CheckCircle, 
  Clock, ArrowLeft, Radio, Eye, Loader2, Share2, MoreVertical 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useStreamingContext, StreamingDebugPanel } from './StreamingServiceProvider';

interface EnhancedLiveStudioProps {
  courseId: string;
  sessionId?: string;
  onNavigate: (path: string) => void;
}

export function EnhancedLiveStudio({ courseId, sessionId, onNavigate }: EnhancedLiveStudioProps) {
  const {
    isInitialized,
    currentSession,
    streamingStatus,
    serviceStatus,
    error,
    createSession,
    startStreaming,
    stopStreaming,
    toggleVideo,
    toggleAudio,
    shareScreen
  } = useStreamingContext();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    quality: 'HD' as const,
    allowChat: true,
    allowQA: true,
    recordSession: true,
    maxViewers: 100,
    isPrivate: false
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stats, setStats] = useState({
    duration: 0,
    viewers: 0,
    bitrate: 0,
    fps: 0
  });

  // Initialize preview stream
  useEffect(() => {
    if (isInitialized && !streamingStatus.isStreaming) {
      initializePreview();
    }
    
    return () => {
      if (localStream && !streamingStatus.isStreaming) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInitialized]);

  // Update video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Stats timer
  useEffect(() => {
    if (streamingStatus.isStreaming) {
      const interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          duration: prev.duration + 1,
          viewers: Math.floor(Math.random() * 10) + 40, // Mock data
          bitrate: Math.floor(Math.random() * 500) + 1500,
          fps: 30
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [streamingStatus.isStreaming]);

  const initializePreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      await createSession(
        courseId,
        'React Hooks Avancés - Session Live',
        'Session live interactive sur les hooks React avancés',
        sessionSettings
      );
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleStartStreaming = async () => {
    if (!currentSession) {
      await handleCreateSession();
      return;
    }

    try {
      await startStreaming(currentSession.id, {
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const handleStopStreaming = async () => {
    try {
      await stopStreaming();
      setStats({ duration: 0, viewers: 0, bitrate: 0, fps: 0 });
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setIsAudioEnabled(enabled);
  };

  const handleShareScreen = async () => {
    try {
      await shareScreen();
      setIsScreenSharing(true);
      setTimeout(() => setIsScreenSharing(false), 5000); // Auto-reset for demo
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Initialisation des services de streaming...</p>
        </div>
      </div>
    );
  }

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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Studio Live - React Avancé</h1>
              <p className="text-muted-foreground">
                {currentSession ? `Session: ${currentSession.id}` : 'Studio de diffusion en direct'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {streamingStatus.isStreaming && (
              <Badge variant="destructive" className="animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                EN DIRECT
              </Badge>
            )}
            
            {serviceStatus?.integration?.fallbackMode && (
              <Badge variant="outline">
                <AlertCircle className="w-3 h-3 mr-1" />
                Mode Développement
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDebug(!showDebug)}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Debug Panel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6">
            <StreamingDebugPanel />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Aperçu vidéo</span>
                  <div className="flex items-center space-x-2">
                    {streamingStatus.isStreaming && (
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        LIVE
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {localStream ? (
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl mb-2">Aucune caméra détectée</h3>
                        <p className="text-white/80">Veuillez vérifier vos permissions</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={isVideoEnabled ? "default" : "secondary"}
                        onClick={handleToggleVideo}
                      >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isAudioEnabled ? "default" : "secondary"}
                        onClick={handleToggleAudio}
                      >
                        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isScreenSharing ? "default" : "outline"}
                        onClick={handleShareScreen}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!streamingStatus.isStreaming ? (
                        <Button
                          size="sm"
                          onClick={handleStartStreaming}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Démarrer Live
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleStopStreaming}
                          variant="destructive"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Arrêter Live
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Statistiques Live
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Spectateurs</span>
                    <span className="font-semibold">{stats.viewers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durée</span>
                    <span className="font-semibold">{formatDuration(stats.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualité</span>
                    <span className="font-semibold">{sessionSettings.quality}</span>
                  </div>
                  {streamingStatus.isStreaming && (
                    <>
                      <div className="flex justify-between">
                        <span>Bitrate</span>
                        <span className="font-semibold">{stats.bitrate} kbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FPS</span>
                        <span className="font-semibold">{stats.fps}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>État du Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Session</span>
                    <Badge variant={currentSession ? "default" : "secondary"}>
                      {currentSession ? "Créée" : "Aucune"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Statut</span>
                    <Badge variant={
                      streamingStatus.status === 'live' ? "destructive" :
                      streamingStatus.status === 'starting' ? "default" :
                      "secondary"
                    }>
                      {streamingStatus.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backend</span>
                    <Badge variant={serviceStatus?.integration?.fallbackMode ? "outline" : "default"}>
                      {serviceStatus?.integration?.fallbackMode ? "Local" : "Connecté"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigate(`/courses/${courseId}/live/${currentSession?.id || 'current'}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vue Spectateur
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Gérer le Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Paramètres de Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quality">Qualité Vidéo</Label>
                <Select 
                  value={sessionSettings.quality} 
                  onValueChange={(value: 'HD' | 'FHD' | '4K') => 
                    setSessionSettings(prev => ({ ...prev, quality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD">HD (720p)</SelectItem>
                    <SelectItem value="FHD">Full HD (1080p)</SelectItem>
                    <SelectItem value="4K">4K (2160p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="allowChat">Autoriser le Chat</Label>
                <Switch 
                  id="allowChat"
                  checked={sessionSettings.allowChat}
                  onCheckedChange={(checked) => 
                    setSessionSettings(prev => ({ ...prev, allowChat: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="allowQA">Autoriser les Q&A</Label>
                <Switch 
                  id="allowQA"
                  checked={sessionSettings.allowQA}
                  onCheckedChange={(checked) => 
                    setSessionSettings(prev => ({ ...prev, allowQA: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="recordSession">Enregistrer la Session</Label>
                <Switch 
                  id="recordSession"
                  checked={sessionSettings.recordSession}
                  onCheckedChange={(checked) => 
                    setSessionSettings(prev => ({ ...prev, recordSession: checked }))
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="maxViewers">Nombre Max de Spectateurs</Label>
                <Input 
                  id="maxViewers"
                  type="number"
                  value={sessionSettings.maxViewers}
                  onChange={(e) => 
                    setSessionSettings(prev => ({ ...prev, maxViewers: parseInt(e.target.value) || 100 }))
                  }
                />
              </div>
              
              <Button onClick={() => setShowSettings(false)} className="w-full">
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface EnhancedLiveViewerProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string) => void;
}

export function EnhancedLiveViewer({ courseId, sessionId, onNavigate }: EnhancedLiveViewerProps) {
  const {
    isInitialized,
    streamingStatus,
    serviceStatus,
    error,
    joinAsViewer,
    leaveSession,
    sendChatMessage
  } = useStreamingContext();

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Sarah (Prof)', message: 'Bienvenue dans cette session live ! 👋', time: '14:30', isTeacher: true },
    { id: '2', user: 'Marie', message: 'Merci pour cette excellente explication', time: '14:32', isTeacher: false },
    { id: '3', user: 'Pierre', message: 'Pouvez-vous expliquer useEffect à nouveau ?', time: '14:33', isTeacher: false },
    { id: '4', user: 'Alex', message: 'Super cours ! 🚀', time: '14:35', isTeacher: false },
  ]);
  const [viewers, setViewers] = useState(47);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-join when component mounts
  useEffect(() => {
    if (isInitialized && !isJoined) {
      handleJoinSession();
    }
    
    return () => {
      if (isJoined) {
        handleLeaveSession();
      }
    };
  }, [isInitialized]);

  // Update video element
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Mock viewer count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => Math.floor(Math.random() * 10) + 40);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJoinSession = async () => {
    try {
      const stream = await joinAsViewer(sessionId);
      setRemoteStream(stream);
      setIsJoined(true);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await leaveSession();
      setIsJoined(false);
      setRemoteStream(null);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      await sendChatMessage(chatMessage);
      
      // Add to local chat (in real app, this would come from WebSocket)
      const newMessage = {
        id: Date.now().toString(),
        user: 'Vous',
        message: chatMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isTeacher: false
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement de la session live...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => onNavigate(`/courses/${courseId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au cours
            </Button>
            <h1 className="text-xl font-semibold mt-2">Session Live - React Hooks Avancés</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              EN DIRECT
            </Badge>
            <div className="flex items-center text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {viewers} spectateurs
            </div>
            {serviceStatus?.integration?.fallbackMode && (
              <Badge variant="outline">
                <AlertCircle className="w-3 h-3 mr-1" />
                Mode Demo
              </Badge>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {remoteStream && isJoined ? (
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        {!isJoined ? (
                          <>
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg mb-2">Connexion à la session live...</h3>
                            <p className="text-white/80">Veuillez patienter</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <h3 className="text-lg mb-2">Session Live en cours</h3>
                            <p className="text-white/80">React Hooks Avancés</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Video controls overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive" className="animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        LIVE
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold mb-1">React Hooks Avancés</h2>
                    <p className="text-muted-foreground text-sm mb-2">
                      Session live interactive avec Sarah Martin
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Démarrée il y a 15 minutes
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {viewers} spectateurs
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Chat en direct
                  <Badge variant="outline">{chatMessages.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded p-3 mb-4 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    {chatMessages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`rounded p-2 ${msg.isTeacher ? 'bg-blue-100 dark:bg-blue-900' : 'bg-background/50'}`}
                      >
                        <div className={`font-medium text-xs mb-1 ${msg.isTeacher ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                          {msg.user} {msg.time && <span className="text-muted-foreground">• {msg.time}</span>}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Votre message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    Envoyer
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>💡 Posez vos questions dans le chat</p>
                </div>
              </CardContent>
            </Card>

            {/* Session Status */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">État de la Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Connexion</span>
                    <Badge variant={isJoined ? "default" : "secondary"}>
                      {isJoined ? "Connecté" : "Déconnecté"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Qualité</span>
                    <Badge variant="outline">HD</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Latence</span>
                    <Badge variant="outline">~2s</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EnhancedLiveManagerProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export function EnhancedLiveManager({ courseId, onNavigate }: EnhancedLiveManagerProps) {
  const {
    isInitialized,
    currentSession,
    streamingStatus,
    serviceStatus,
    createSession,
    refreshServiceStatus
  } = useStreamingContext();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    description: '',
    settings: {
      quality: 'HD' as const,
      allowChat: true,
      allowQA: true,
      recordSession: true,
      maxViewers: 100,
      isPrivate: false
    }
  });

  const [mockSessions] = useState([
    {
      id: 'session-1',
      title: 'React Hooks Avancés - Session Live',
      status: 'ready',
      createdAt: 'Aujourd\'hui',
      viewers: 0
    },
    {
      id: 'session-2', 
      title: 'Introduction aux Tests React',
      status: 'completed',
      createdAt: 'Hier',
      viewers: 23
    }
  ]);

  const handleCreateSession = async () => {
    try {
      await createSession(
        courseId,
        newSessionData.title,
        newSessionData.description,
        newSessionData.settings
      );
      setShowCreateDialog(false);
      setNewSessionData({
        title: '',
        description: '',
        settings: {
          quality: 'HD',
          allowChat: true,
          allowQA: true,
          recordSession: true,
          maxViewers: 100,
          isPrivate: false
        }
      });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement du gestionnaire de sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sessions Live</h2>
          <p className="text-muted-foreground">Créez et gérez vos sessions de streaming</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refreshServiceStatus}>
            <Settings className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Video className="w-4 h-4 mr-2" />
                Nouvelle session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une Session Live</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de la session</Label>
                  <Input
                    id="title"
                    value={newSessionData.title}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: React Hooks Avancés"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSessionData.description}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le contenu de votre session..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="chat">Autoriser le chat</Label>
                  <Switch
                    id="chat"
                    checked={newSessionData.settings.allowChat}
                    onCheckedChange={(checked) => 
                      setNewSessionData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, allowChat: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="record">Enregistrer</Label>
                  <Switch
                    id="record"
                    checked={newSessionData.settings.recordSession}
                    onCheckedChange={(checked) => 
                      setNewSessionData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, recordSession: checked }
                      }))
                    }
                  />
                </div>
                <Button onClick={handleCreateSession} className="w-full">
                  Créer la session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  serviceStatus.integration?.fallbackMode ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <p className="font-medium">
                    {serviceStatus.integration?.fallbackMode ? 'Mode Développement' : 'Services Connectés'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {serviceStatus.integration?.fallbackMode 
                      ? 'Utilisation du serveur proxy local'
                      : 'Spring Boot et Janus Gateway disponibles'
                    }
                  </p>
                </div>
              </div>
              <Badge variant={serviceStatus.integration?.fallbackMode ? "outline" : "default"}>
                {serviceStatus.integration?.springBoot?.available && serviceStatus.integration?.janus?.available
                  ? 'Production' 
                  : serviceStatus.integration?.springBoot?.available
                  ? 'Spring Boot Only'
                  : 'Local'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  streamingStatus.isStreaming ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                }`}></div>
                <div>
                  <h3 className="font-medium">{currentSession.title}</h3>
                  <p className="text-sm text-muted-foreground">Session actuelle • ID: {currentSession.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={streamingStatus.isStreaming ? "destructive" : "default"}>
                  {streamingStatus.isStreaming ? 'En Direct' : 'Prête'}
                </Badge>
                <Button 
                  size="sm" 
                  onClick={() => onNavigate(`/teacher/live/${courseId}/${currentSession.id}`)}
                >
                  {streamingStatus.isStreaming ? 'Gérer' : 'Démarrer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <div className="grid gap-4">
        {mockSessions.map(session => (
          <Card key={session.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    session.status === 'ready' ? 'bg-green-500' : 
                    session.status === 'completed' ? 'bg-gray-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {session.createdAt} • {session.viewers} spectateurs max
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    session.status === 'ready' ? 'default' :
                    session.status === 'completed' ? 'secondary' : 'outline'
                  }>
                    {session.status === 'ready' ? 'Prêt' :
                     session.status === 'completed' ? 'Terminé' : 'En attente'}
                  </Badge>
                  {session.status === 'ready' && (
                    <Button 
                      size="sm" 
                      onClick={() => onNavigate(`/teacher/live/${courseId}/${session.id}`)}
                    >
                      Démarrer
                    </Button>
                  )}
                  {session.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      Voir l'enregistrement
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {mockSessions.length === 0 && !currentSession && (
          <Card>
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Créez votre première session</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Démarrez une session live pour interagir avec vos étudiants en temps réel
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Créer une session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}