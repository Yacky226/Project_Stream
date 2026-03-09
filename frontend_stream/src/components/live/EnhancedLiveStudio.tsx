import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorSpeaker, 
  Monitor,
  Users, 
  MessageSquare, 
  Hand,
  Radio, 
  Eye, 
  ArrowLeft,
  Settings,
  Send,
  MoreVertical,
  Shield,
  Ban,
  Volume2,
  VolumeX,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { useStreaming } from '../../lib/streaming';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isQuestion: boolean;
  isFromTeacher: boolean;
  isModerationRequired?: boolean;
}

interface HandRaise {
  id: string;
  userId: string;
  username: string;
  timestamp: Date;
  reason?: string;
}

interface Participant {
  id: string;
  username: string;
  role: 'teacher' | 'student';
  isVideoOn: boolean;
  isAudioOn: boolean;
  isHandRaised: boolean;
  joinTime: Date;
  isMuted?: boolean;
  isBanned?: boolean;
}

interface EnhancedLiveStudioProps {
  courseId: string;
  sessionId?: string;
  onNavigate: (path: string) => void;
}

export function EnhancedLiveStudio({ courseId, sessionId, onNavigate }: EnhancedLiveStudioProps) {
  // Streaming state
  const { 
    streamingService, 
    startStreaming, 
    stopStreaming, 
    toggleVideo, 
    toggleAudio, 
    shareScreen,
    sendChatMessage,
    getCurrentSession 
  } = useStreaming();
  
  // UI State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'questions'>('chat');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'teacher',
      username: 'Sarah Martin',
      message: 'Bienvenue dans cette session de React Hooks Avancés ! 👋',
      timestamp: new Date(Date.now() - 300000),
      isQuestion: false,
      isFromTeacher: true
    },
    {
      id: '2',
      userId: 'student1',
      username: 'Marie Dupont',
      message: 'Merci ! Très hâte de commencer cette session',
      timestamp: new Date(Date.now() - 240000),
      isQuestion: false,
      isFromTeacher: false
    },
    {
      id: '3',
      userId: 'student2',
      username: 'Pierre Martin',
      message: 'Est-ce que nous allons voir useEffect dans cette session ?',
      timestamp: new Date(Date.now() - 180000),
      isQuestion: true,
      isFromTeacher: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatMuted, setIsChatMuted] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Hand raises state
  const [handRaises, setHandRaises] = useState<HandRaise[]>([
    {
      id: '1',
      userId: 'student3',
      username: 'Alex Chen',
      timestamp: new Date(Date.now() - 120000),
      reason: 'Question sur les hooks personnalisés'
    },
    {
      id: '2',
      userId: 'student4',
      username: 'Sophie Bernard',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'teacher',
      username: 'Sarah Martin (Vous)',
      role: 'teacher',
      isVideoOn: true,
      isAudioOn: true,
      isHandRaised: false,
      joinTime: new Date(Date.now() - 900000)
    },
    {
      id: 'student1',
      username: 'Marie Dupont',
      role: 'student',
      isVideoOn: false,
      isAudioOn: true,
      isHandRaised: false,
      joinTime: new Date(Date.now() - 600000)
    },
    {
      id: 'student2',
      username: 'Pierre Martin',
      role: 'student',
      isVideoOn: false,
      isAudioOn: true,
      isHandRaised: false,
      joinTime: new Date(Date.now() - 450000)
    },
    {
      id: 'student3',
      username: 'Alex Chen',
      role: 'student',
      isVideoOn: false,
      isAudioOn: false,
      isHandRaised: true,
      joinTime: new Date(Date.now() - 300000)
    }
  ]);
  
  // Stats
  const [stats, setStats] = useState({
    viewerCount: 47,
    duration: '00:15:30',
    quality: '1080p',
    bitrate: '2500 kbps'
  });
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Handlers
  const handleStartStopStream = async () => {
    try {
      if (isStreaming) {
        await stopStreaming();
        setIsStreaming(false);
      } else {
        await startStreaming(sessionId || 'demo', {
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
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
        // Stop screen sharing - revert to camera
        setIsSharingScreen(false);
      } else {
        await shareScreen();
        setIsSharingScreen(true);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'teacher',
      username: 'Sarah Martin (Vous)',
      message: newMessage,
      timestamp: new Date(),
      isQuestion: false,
      isFromTeacher: true
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    try {
      await sendChatMessage(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleApproveHandRaise = (handRaiseId: string) => {
    setHandRaises(prev => prev.filter(h => h.id !== handRaiseId));
    // In real implementation, this would grant speaking permission
  };
  
  const handleDenyHandRaise = (handRaiseId: string) => {
    setHandRaises(prev => prev.filter(h => h.id !== handRaiseId));
  };
  
  const handleMuteParticipant = (participantId: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ));
  };
  
  const handleRemoveMessage = (messageId: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== messageId));
  };
  
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
              <h1 className="text-2xl font-semibold">Studio Live - React Hooks Avancés</h1>
              <p className="text-muted-foreground">Diffusion en direct avec contrôles avancés</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={isStreaming ? "destructive" : "secondary"} className={isStreaming ? "animate-pulse" : ""}>
              <Radio className="w-3 h-3 mr-1" />
              {isStreaming ? 'EN DIRECT' : 'HORS LIGNE'}
            </Badge>
            <div className="flex items-center text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {stats.viewerCount} spectateurs
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main video area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Preview */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl mb-2">Aperçu du studio</h3>
                    <p className="text-white/80 mb-4">
                      {isSharingScreen ? 'Partage d\'écran actif' : 'Caméra principale'}
                    </p>
                    <div className="text-sm text-white/60">
                      Qualité: {stats.quality} • Débit: {stats.bitrate}
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge variant={isVideoOn ? "default" : "destructive"} className="text-xs">
                      {isVideoOn ? <Video className="w-3 h-3 mr-1" /> : <VideoOff className="w-3 h-3 mr-1" />}
                      {isVideoOn ? 'Vidéo ON' : 'Vidéo OFF'}
                    </Badge>
                    <Badge variant={isAudioOn ? "default" : "destructive"} className="text-xs">
                      {isAudioOn ? <Mic className="w-3 h-3 mr-1" /> : <MicOff className="w-3 h-3 mr-1" />}
                      {isAudioOn ? 'Audio ON' : 'Audio OFF'}
                    </Badge>
                    {isSharingScreen && (
                      <Badge variant="secondary" className="text-xs">
                        <Monitor className="w-3 h-3 mr-1" />
                        Écran partagé
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Stream control */}
                    <Button 
                      size="lg"
                      variant={isStreaming ? "destructive" : "default"}
                      onClick={handleStartStopStream}
                    >
                      <Radio className="w-4 h-4 mr-2" />
                      {isStreaming ? 'Arrêter le live' : 'Démarrer le live'}
                    </Button>
                    
                    {/* Video control */}
                    <Button 
                      variant={isVideoOn ? "default" : "destructive"}
                      onClick={handleToggleVideo}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    
                    {/* Audio control */}
                    <Button 
                      variant={isAudioOn ? "default" : "destructive"}
                      onClick={handleToggleAudio}
                    >
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    
                    {/* Screen share */}
                    <Button 
                      variant={isSharingScreen ? "secondary" : "outline"}
                      onClick={handleShareScreen}
                    >
                      {isSharingScreen ? <MonitorSpeaker className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques en temps réel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">{stats.viewerCount}</div>
                    <div className="text-sm text-muted-foreground">Spectateurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">{stats.duration}</div>
                    <div className="text-sm text-muted-foreground">Durée</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-600">{stats.quality}</div>
                    <div className="text-sm text-muted-foreground">Qualité</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-orange-600">{stats.bitrate}</div>
                    <div className="text-sm text-muted-foreground">Débit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Hand raises alert */}
            {handRaises.length > 0 && (
              <Alert>
                <Hand className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>{handRaises.length} main(s) levée(s)</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('questions')}
                    >
                      Voir
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Tabs */}
            <Card>
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="participants" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Participants
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="text-xs relative">
                      <Hand className="w-3 h-3 mr-1" />
                      Questions
                      {handRaises.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 text-xs p-0 flex items-center justify-center">
                          {handRaises.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab}>
                  {/* Chat Tab */}
                  <TabsContent value="chat" className="m-0">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Chat en direct</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsChatMuted(!isChatMuted)}
                          >
                            {isChatMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-64 mb-3" ref={chatScrollRef}>
                        <div className="space-y-2 pr-3">
                          {chatMessages.map((message) => (
                            <div key={message.id} className="group">
                              <div className={`p-2 rounded-lg text-sm ${
                                message.isFromTeacher 
                                  ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-blue-500' 
                                  : message.isQuestion
                                  ? 'bg-orange-50 dark:bg-orange-950/20 border-l-2 border-orange-500'
                                  : 'bg-muted'
                              }`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium">{message.username}</span>
                                      {message.isQuestion && (
                                        <Badge variant="outline" className="text-xs">
                                          Question
                                        </Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {message.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div>{message.message}</div>
                                  </div>
                                  
                                  {!message.isFromTeacher && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                        >
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleRemoveMessage(message.id)}>
                                          <Ban className="w-3 h-3 mr-2" />
                                          Supprimer
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Shield className="w-3 h-3 mr-2" />
                                          Modérer
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Tapez votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="text-sm"
                        />
                        <Button size="sm" onClick={handleSendMessage}>
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Participants Tab */}
                  <TabsContent value="participants" className="m-0">
                    <div className="p-4">
                      <div className="text-sm font-medium mb-3">
                        Participants ({participants.length})
                      </div>
                      
                      <ScrollArea className="h-80">
                        <div className="space-y-2 pr-3">
                          {participants.map((participant) => (
                            <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {participant.username.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{participant.username}</div>
                                  <div className="text-xs text-muted-foreground flex items-center space-x-2">
                                    <span>{participant.role === 'teacher' ? 'Enseignant' : 'Étudiant'}</span>
                                    {participant.isHandRaised && (
                                      <Hand className="w-3 h-3 text-orange-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  participant.isVideoOn ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                                <div className={`w-2 h-2 rounded-full ${
                                  participant.isAudioOn ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                                {participant.role === 'student' && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleMuteParticipant(participant.id)}>
                                        {participant.isMuted ? <Volume2 className="w-3 h-3 mr-2" /> : <VolumeX className="w-3 h-3 mr-2" />}
                                        {participant.isMuted ? 'Réactiver' : 'Couper le son'}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">
                                        <Ban className="w-3 h-3 mr-2" />
                                        Exclure
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Questions/Hand Raises Tab */}
                  <TabsContent value="questions" className="m-0">
                    <div className="p-4">
                      <div className="text-sm font-medium mb-3">
                        Mains levées ({handRaises.length})
                      </div>
                      
                      <ScrollArea className="h-80">
                        {handRaises.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Hand className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Aucune main levée</p>
                          </div>
                        ) : (
                          <div className="space-y-3 pr-3">
                            {handRaises.map((handRaise) => (
                              <div key={handRaise.id} className="p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-800">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="font-medium text-sm">{handRaise.username}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {handRaise.timestamp.toLocaleTimeString()}
                                    </div>
                                  </div>
                                  <Hand className="w-4 h-4 text-orange-500 mt-0.5" />
                                </div>
                                
                                {handRaise.reason && (
                                  <div className="text-sm mb-3 p-2 bg-background/50 rounded">
                                    "{handRaise.reason}"
                                  </div>
                                )}
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => handleApproveHandRaise(handRaise.id)}
                                    className="flex-1"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Autoriser
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDenyHandRaise(handRaise.id)}
                                    className="flex-1"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Refuser
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}