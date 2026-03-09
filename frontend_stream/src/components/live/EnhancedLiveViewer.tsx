import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Video, 
  Mic, 
  MicOff, 
  Hand,
  MessageSquare, 
  Users, 
  Radio, 
  Eye, 
  ArrowLeft,
  Send,
  ThumbsUp,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useStreaming } from '../../lib/streaming';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isQuestion: boolean;
  isFromTeacher: boolean;
  likes?: number;
  isLiked?: boolean;
}

interface EnhancedLiveViewerProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string) => void;
}

export function EnhancedLiveViewer({ courseId, sessionId, onNavigate }: EnhancedLiveViewerProps) {
  // Streaming state
  const { 
    joinAsViewer, 
    leaveSession, 
    sendChatMessage 
  } = useStreaming();
  
  // UI State
  const [isConnected, setIsConnected] = useState(true);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [quality, setQuality] = useState('1080p');
  
  // Hand raise state
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [handRaiseReason, setHandRaiseReason] = useState('');
  const [showHandRaiseDialog, setShowHandRaiseDialog] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'teacher',
      username: 'Sarah Martin',
      message: 'Bienvenue dans cette session de React Hooks Avancés ! 👋',
      timestamp: new Date(Date.now() - 300000),
      isQuestion: false,
      isFromTeacher: true,
      likes: 5
    },
    {
      id: '2',
      userId: 'student1',
      username: 'Marie Dupont',
      message: 'Merci ! Très hâte de commencer cette session',
      timestamp: new Date(Date.now() - 240000),
      isQuestion: false,
      isFromTeacher: false,
      likes: 2
    },
    {
      id: '3',
      userId: 'student2',
      username: 'Pierre Martin',
      message: 'Est-ce que nous allons voir useEffect dans cette session ?',
      timestamp: new Date(Date.now() - 180000),
      isQuestion: true,
      isFromTeacher: false,
      likes: 8
    },
    {
      id: '4',
      userId: 'teacher',
      username: 'Sarah Martin',
      message: 'Excellente question Pierre ! Oui, nous couvrirons useEffect en détail',
      timestamp: new Date(Date.now() - 120000),
      isQuestion: false,
      isFromTeacher: true,
      likes: 12
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTypingQuestion, setIsTypingQuestion] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Participants (simplified for viewer)
  const [stats, setStats] = useState({
    viewerCount: 47,
    duration: '00:15:30',
    quality: '1080p'
  });
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Handlers
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'currentUser',
      username: 'Vous',
      message: newMessage,
      timestamp: new Date(),
      isQuestion: isTypingQuestion,
      isFromTeacher: false,
      likes: 0,
      isLiked: false
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTypingQuestion(false);
    
    try {
      await sendChatMessage(newMessage, isTypingQuestion);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleRaiseHand = () => {
    if (isHandRaised) {
      setIsHandRaised(false);
      setHandRaiseReason('');
    } else {
      setShowHandRaiseDialog(true);
    }
  };
  
  const confirmHandRaise = () => {
    setIsHandRaised(true);
    setShowHandRaiseDialog(false);
    // In real implementation, this would send the hand raise to the server
  };
  
  const handleLikeMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const wasLiked = msg.isLiked;
        return {
          ...msg,
          likes: wasLiked ? (msg.likes || 0) - 1 : (msg.likes || 0) + 1,
          isLiked: !wasLiked
        };
      }
      return msg;
    }));
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };
  
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      setVolume([0]);
    } else {
      setVolume([80]);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate(`/courses/${courseId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au cours
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Session Live - React Hooks Avancés</h1>
              <p className="text-sm text-muted-foreground">Avec Sarah Martin</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              EN DIRECT
            </Badge>
            <div className="flex items-center text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {stats.viewerCount} spectateurs
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {stats.duration}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main video area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Connection status */}
            {!isConnected && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Connexion instable. Tentative de reconnexion...
                </AlertDescription>
              </Alert>
            )}
            
            {/* Hand raise status */}
            {isHandRaised && (
              <Alert>
                <Hand className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Votre main est levée</span>
                  <Button size="sm" variant="outline" onClick={handleRaiseHand}>
                    Baisser la main
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Video Player */}
            <Card>
              <CardContent className="p-0 relative">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-lg mb-2">Session Live en cours</h3>
                    <p className="text-white/80">React Hooks Avancés</p>
                  </div>
                  
                  {/* Video controls overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      
                      <div className="flex items-center space-x-2 text-white">
                        <Slider
                          value={volume}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="w-20"
                        />
                        <span className="text-xs min-w-[2rem]">{volume[0]}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Settings className="w-4 h-4 mr-1" />
                            {quality}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setQuality('4K')}>4K (Ultra)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQuality('1080p')}>1080p (HD)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQuality('720p')}>720p</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQuality('480p')}>480p</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                        onClick={toggleFullscreen}
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant={isHandRaised ? "destructive" : "outline"}
                      onClick={handleRaiseHand}
                    >
                      <Hand className="w-4 h-4 mr-2" />
                      {isHandRaised ? 'Main levée' : 'Lever la main'}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Réagir
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Qualité: {quality} • Connexion stable
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="text-sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="participants" className="text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      Participants
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab}>
                  {/* Chat Tab */}
                  <TabsContent value="chat" className="m-0">
                    <div className="p-4">
                      <ScrollArea className="h-80 mb-4" ref={chatScrollRef}>
                        <div className="space-y-3 pr-3">
                          {chatMessages.map((message) => (
                            <div key={message.id} className="group">
                              <div className={`p-3 rounded-lg text-sm ${
                                message.isFromTeacher 
                                  ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-blue-500' 
                                  : message.isQuestion
                                  ? 'bg-orange-50 dark:bg-orange-950/20 border-l-2 border-orange-500'
                                  : 'bg-muted'
                              }`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{message.username}</span>
                                    {message.isQuestion && (
                                      <Badge variant="outline" className="text-xs">
                                        Question
                                      </Badge>
                                    )}
                                    {message.isFromTeacher && (
                                      <Badge variant="secondary" className="text-xs">
                                        Enseignant
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                
                                <div className="mb-2">{message.message}</div>
                                
                                <div className="flex items-center justify-between">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleLikeMessage(message.id)}
                                    className={`h-6 px-2 ${message.isLiked ? 'text-blue-600' : 'text-muted-foreground'}`}
                                  >
                                    <ThumbsUp className="w-3 h-3 mr-1" />
                                    {message.likes || 0}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={isTypingQuestion}
                              onChange={(e) => setIsTypingQuestion(e.target.checked)}
                              className="rounded border-border"
                            />
                            <span>C'est une question</span>
                          </label>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Input
                            placeholder={isTypingQuestion ? "Posez votre question..." : "Tapez votre message..."}
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
                    </div>
                  </TabsContent>

                  {/* Participants Tab */}
                  <TabsContent value="participants" className="m-0">
                    <div className="p-4">
                      <div className="text-sm font-medium mb-3">
                        Participants ({stats.viewerCount})
                      </div>
                      
                      <ScrollArea className="h-80">
                        <div className="space-y-2 pr-3">
                          <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                              SM
                            </div>
                            <div>
                              <div className="font-medium text-sm">Sarah Martin</div>
                              <div className="text-xs text-muted-foreground flex items-center space-x-2">
                                <span>Enseignant</span>
                                <Video className="w-3 h-3 text-green-500" />
                                <Mic className="w-3 h-3 text-green-500" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium">
                              V
                            </div>
                            <div>
                              <div className="font-medium text-sm">Vous</div>
                              <div className="text-xs text-muted-foreground flex items-center space-x-2">
                                <span>Spectateur</span>
                                {isHandRaised && <Hand className="w-3 h-3 text-orange-500" />}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground text-center py-4">
                            + {stats.viewerCount - 2} autres spectateurs
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Hand raise dialog */}
      {showHandRaiseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hand className="w-5 h-5 mr-2" />
                Lever la main
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Indiquez pourquoi vous souhaitez prendre la parole (optionnel)
              </p>
              <Input
                placeholder="Raison (ex: Question sur useState)"
                value={handRaiseReason}
                onChange={(e) => setHandRaiseReason(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={confirmHandRaise} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Lever la main
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowHandRaiseDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}