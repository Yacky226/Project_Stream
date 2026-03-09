import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft,
  Radio,
  Eye,
  Users,
  MessageSquare,
  Hand,
  Settings,
  Monitor,
  Video,
  Mic,
  Activity
} from 'lucide-react';
import { EnhancedLiveStudio } from './EnhancedLiveStudio';
import { EnhancedLiveViewer } from './EnhancedLiveViewer';
import { LiveStreamControls } from './LiveStreamControls';
import { LiveChatManager } from './LiveChatManager';
import { HandRaiseManager } from './HandRaiseManager';
import { useStreaming } from '../../lib/streaming';

interface AdvancedLiveSessionProps {
  courseId: string;
  sessionId?: string;
  userRole: 'teacher' | 'student';
  onNavigate: (path: string) => void;
}

export function AdvancedLiveSession({ 
  courseId, 
  sessionId, 
  userRole, 
  onNavigate 
}: AdvancedLiveSessionProps) {
  const isTeacher = userRole === 'teacher';
  
  // Streaming state
  const { 
    streamingService,
    startStreaming,
    stopStreaming,
    toggleVideo,
    toggleAudio,
    shareScreen,
    joinAsViewer,
    leaveSession,
    sendChatMessage,
    getStreamingStatus
  } = useStreaming();
  
  // Session state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'hands' | 'controls'>('chat');
  const [handRaiseCount, setHandRaiseCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Session stats
  const [sessionStats, setSessionStats] = useState({
    viewerCount: 47,
    duration: '00:15:30',
    quality: '1080p',
    bitrate: '2500 kbps',
    handRaises: 3,
    chatMessages: 45
  });
  
  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (isTeacher) {
          // Teacher: prepare for streaming
          console.log('Initializing teacher session...');
          setIsConnected(true);
        } else {
          // Student: join as viewer
          console.log('Joining as viewer...');
          await joinAsViewer(sessionId || 'demo');
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setIsConnected(false);
      }
    };
    
    initializeSession();
    
    return () => {
      if (!isTeacher) {
        leaveSession();
      }
    };
  }, [isTeacher, sessionId]);
  
  // Streaming handlers
  const handleStartStopStream = async () => {
    try {
      if (isStreaming) {
        await stopStreaming();
        setIsStreaming(false);
      } else {
        await startStreaming(sessionId || 'demo');
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error toggling stream:', error);
    }
  };
  
  const handleToggleVideo = () => {
    const newState = toggleVideo();
    setIsVideoOn(newState);
  };
  
  const handleToggleAudio = () => {
    const newState = toggleAudio();
    setIsAudioOn(newState);
  };
  
  const handleShareScreen = async () => {
    try {
      if (isSharingScreen) {
        setIsSharingScreen(false);
      } else {
        await shareScreen();
        setIsSharingScreen(true);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };
  
  const handleSendMessage = async (message: string, type: 'message' | 'question' = 'message') => {
    try {
      await sendChatMessage(message, type === 'question');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleHandRaiseChange = (count: number) => {
    setHandRaiseCount(count);
    setSessionStats(prev => ({ ...prev, handRaises: count }));
  };
  
  const handleGrantSpeaking = (userId: string, duration: number) => {
    console.log(`Granting speaking permission to ${userId} for ${duration} seconds`);
    // Implementation would involve WebRTC signaling
  };
  
  const handleRevokeSpeaking = (userId: string) => {
    console.log(`Revoking speaking permission from ${userId}`);
    // Implementation would involve WebRTC signaling
  };
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Connexion à la session...</p>
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
              onClick={() => onNavigate(isTeacher ? '/teacher/dashboard' : `/courses/${courseId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {isTeacher ? 'Studio Live' : 'Session Live'} - React Hooks Avancés
              </h1>
              <p className="text-muted-foreground">
                {isTeacher ? 'Contrôles de diffusion avancés' : 'Avec Sarah Martin'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={isStreaming ? "destructive" : "secondary"} className={isStreaming ? "animate-pulse" : ""}>
              <Radio className="w-3 h-3 mr-1" />
              {isStreaming ? 'EN DIRECT' : 'HORS LIGNE'}
            </Badge>
            <div className="flex items-center text-sm space-x-4">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {sessionStats.viewerCount}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {sessionStats.viewerCount + 1}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video area */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-white">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isStreaming ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                    }`}>
                      {isStreaming ? (
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      ) : (
                        <Video className="w-8 h-8" />
                      )}
                    </div>
                    <h3 className="text-xl mb-2">
                      {isStreaming ? 'Session Live en cours' : (isTeacher ? 'Studio prêt' : 'En attente du live')}
                    </h3>
                    <p className="text-white/80 mb-4">
                      {isSharingScreen ? 'Partage d\'écran actif' : 'React Hooks Avancés'}
                    </p>
                    <div className="text-sm text-white/60">
                      Qualité: {sessionStats.quality} • Débit: {sessionStats.bitrate}
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge variant={isVideoOn ? "default" : "destructive"} className="text-xs">
                      <Video className="w-3 h-3 mr-1" />
                      {isVideoOn ? 'Vidéo ON' : 'Vidéo OFF'}
                    </Badge>
                    <Badge variant={isAudioOn ? "default" : "destructive"} className="text-xs">
                      <Mic className="w-3 h-3 mr-1" />
                      {isAudioOn ? 'Audio ON' : 'Audio OFF'}
                    </Badge>
                    {isSharingScreen && (
                      <Badge variant="secondary" className="text-xs">
                        <Monitor className="w-3 h-3 mr-1" />
                        Écran partagé
                      </Badge>
                    )}
                  </div>
                  
                  {/* Duration indicator */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/30">
                      {sessionStats.duration}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream controls for teachers */}
            {isTeacher && (
              <LiveStreamControls
                isStreaming={isStreaming}
                isVideoOn={isVideoOn}
                isAudioOn={isAudioOn}
                isSharingScreen={isSharingScreen}
                onToggleVideo={handleToggleVideo}
                onToggleAudio={handleToggleAudio}
                onShareScreen={handleShareScreen}
                onStartStream={handleStartStopStream}
                onStopStream={handleStartStopStream}
              />
            )}

            {/* Basic controls for students */}
            {!isTeacher && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{sessionStats.viewerCount}</div>
                      <div className="text-sm text-muted-foreground">Spectateurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{sessionStats.duration}</div>
                      <div className="text-sm text-muted-foreground">Durée</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">{sessionStats.quality}</div>
                      <div className="text-sm text-muted-foreground">Qualité</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        <Activity className="w-5 h-5 mx-auto" />
                      </div>
                      <div className="text-sm text-muted-foreground">Connexion stable</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick alerts */}
            {handRaiseCount > 0 && isTeacher && (
              <Alert>
                <Hand className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{handRaiseCount} main(s) levée(s)</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActiveTab('hands')}
                  >
                    Voir
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {unreadMessages > 0 && (
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{unreadMessages} nouveau(x) message(s)</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActiveTab('chat')}
                  >
                    Voir
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Main sidebar tabs */}
            <Card>
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                    <TabsTrigger value="chat" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                      {unreadMessages > 0 && (
                        <Badge variant="destructive" className="ml-1 w-4 h-4 text-xs p-0 flex items-center justify-center">
                          {unreadMessages}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="hands" className="text-xs">
                      <Hand className="w-3 h-3 mr-1" />
                      {isTeacher ? 'Mains' : 'Parole'}
                      {handRaiseCount > 0 && isTeacher && (
                        <Badge variant="destructive" className="ml-1 w-4 h-4 text-xs p-0 flex items-center justify-center">
                          {handRaiseCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    {isTeacher && (
                      <TabsTrigger value="controls" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Contrôles
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab}>
                  {/* Chat Tab */}
                  <TabsContent value="chat" className="m-0">
                    <LiveChatManager
                      isTeacher={isTeacher}
                      sessionId={sessionId || 'demo'}
                      onSendMessage={handleSendMessage}
                    />
                  </TabsContent>

                  {/* Hand Raises Tab */}
                  <TabsContent value="hands" className="m-0">
                    <HandRaiseManager
                      isTeacher={isTeacher}
                      sessionId={sessionId || 'demo'}
                      onHandRaiseChange={handleHandRaiseChange}
                      onGrantSpeaking={handleGrantSpeaking}
                      onRevokeSpeaking={handleRevokeSpeaking}
                    />
                  </TabsContent>

                  {/* Advanced Controls Tab (Teacher only) */}
                  {isTeacher && (
                    <TabsContent value="controls" className="m-0">
                      <div className="p-4 space-y-4">
                        <div className="text-sm font-medium mb-3">Contrôles avancés</div>
                        
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="w-4 h-4 mr-2" />
                            Paramètres de session
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="w-4 h-4 mr-2" />
                            Gestion des participants
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <Monitor className="w-4 h-4 mr-2" />
                            Options d'affichage
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <Activity className="w-4 h-4 mr-2" />
                            Statistiques détaillées
                          </Button>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="text-xs text-muted-foreground mb-2">Session: {sessionId || 'demo'}</div>
                          <div className="text-xs text-muted-foreground">Cours: {courseId}</div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}