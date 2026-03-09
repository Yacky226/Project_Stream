import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Video,
  VideoOff, 
  Volume2,
  VolumeX,
  MessageSquare,
  Users,
  Share2,
  Heart,
  ThumbsUp,
  Eye,
  Settings,
  Maximize,
  Minimize,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  Radio,
  HelpCircle,
  Send
} from 'lucide-react';
// import { useAuth } from '../../lib/auth';

interface LiveViewerPageProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string) => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userRole: 'student' | 'teacher' | 'moderator';
  message: string;
  timestamp: Date;
  isQuestion: boolean;
  likes: number;
  isLiked: boolean;
}

interface StreamInfo {
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  startTime: Date;
  viewers: number;
  isLive: boolean;
  quality: string;
  duration: number;
}

interface QAQuestion {
  id: string;
  userId: string;
  username: string;
  question: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  isAnswered: boolean;
  answer?: string;
  answerTimestamp?: Date;
}

export function LiveViewerPage({ courseId, sessionId, onNavigate }: LiveViewerPageProps) {
  // const { getCurrentUser } = useAuth();
  // const user = getCurrentUser();
  const user = { id: 'student-1', name: 'Étudiant' };
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Stream state
  const [streamInfo, setStreamInfo] = useState<StreamInfo>({
    title: 'React Hooks Avancés - Session Live',
    description: 'Masterclass sur les hooks React avancés, les patterns d\'optimisation et les meilleures pratiques.',
    instructor: {
      id: 'instructor-1',
      name: 'Sarah Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150'
    },
    startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
    viewers: 47,
    isLive: true,
    quality: '1080p',
    duration: 15 * 60 // 15 minutes
  });
  
  // Player state
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  
  // Chat and interaction
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'instructor-1',
      username: 'Sarah Rodriguez',
      userRole: 'teacher',
      message: 'Bonjour tout le monde ! Bienvenue dans cette session sur les hooks React avancés 👋',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isQuestion: false,
      likes: 12,
      isLiked: false
    },
    {
      id: '2',
      userId: 'user-1',
      username: 'Marie Dubois',
      userRole: 'student',
      message: 'Merci pour cette session ! Très intéressant',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      isQuestion: false,
      likes: 3,
      isLiked: true
    },
    {
      id: '3',
      userId: 'user-2', 
      username: 'Pierre Martin',
      userRole: 'student',
      message: 'Pouvez-vous expliquer la différence entre useCallback et useMemo ?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isQuestion: true,
      likes: 8,
      isLiked: false
    }
  ]);
  
  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>([
    {
      id: '1',
      userId: 'user-3',
      username: 'Alex Chen',
      question: 'Comment optimiser les re-renders avec React.memo ?',
      timestamp: new Date(Date.now() - 7 * 60 * 1000),
      likes: 5,
      isLiked: false,
      isAnswered: true,
      answer: 'React.memo est un HOC qui évite les re-renders inutiles en comparant les props. Il faut l\'utiliser avec parcimonie.',
      answerTimestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      userId: 'user-4',
      username: 'Julie Lambert',
      question: 'Quand utiliser useReducer au lieu de useState ?',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      likes: 3,
      isLiked: true,
      isAnswered: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  
  // Simulate stream initialization
  const initializeStream = () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsLoading(false);
    }, 1000);
  };
  
  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        username: user?.name || 'Anonyme',
        userRole: 'student',
        message: newMessage,
        timestamp: new Date(),
        isQuestion: false,
        likes: 0,
        isLiked: false
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
        body: JSON.stringify({ ...message, sessionId })
      });
    }
  };
  
  const submitQuestion = () => {
    if (newQuestion.trim()) {
      const question: QAQuestion = {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        username: user?.name || 'Anonyme',
        question: newQuestion,
        timestamp: new Date(),
        likes: 0,
        isLiked: false,
        isAnswered: false
      };
      
      setQaQuestions(prev => [...prev, question]);
      setNewQuestion('');
      
      // Send to backend
      fetch('/api/live/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ ...question, sessionId })
      });
    }
  };
  
  const likeMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1, isLiked: !msg.isLiked }
        : msg
    ));
  };
  
  const likeQuestion = (questionId: string) => {
    setQaQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, likes: q.isLiked ? q.likes - 1 : q.likes + 1, isLiked: !q.isLiked }
        : q
    ));
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
              ← Retour au cours
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{streamInfo.title}</h1>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <span>{streamInfo.instructor.name}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {streamInfo.viewers} spectateurs
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(streamInfo.duration)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {streamInfo.isLive && (
              <Badge variant="destructive" className="animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                EN DIRECT
              </Badge>
            )}
            
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className={connectionStatus === 'connected' ? 'bg-green-500' : ''}
            >
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  {streamInfo.quality}
                </>
              ) : connectionStatus === 'connecting' ? (
                'Connexion...'
              ) : connectionStatus === 'error' ? (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Erreur
                </>
              ) : (
                'Déconnecté'
              )}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="text-center text-white">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Connexion au stream...</p>
                      </div>
                    </div>
                  ) : connectionStatus === 'error' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="text-center text-white">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <p className="mb-2">Erreur de connexion</p>
                        <p className="text-sm text-gray-400">Impossible de charger le stream</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => window.location.reload()}
                        >
                          Réessayer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        poster="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600"
                      />
                      
                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            
                            <div className="flex items-center space-x-2 text-white text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span>EN DIRECT</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleFullscreen}
                              className="text-white hover:bg-white/20"
                            >
                              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stream Info */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={streamInfo.instructor.avatar} 
                    alt={streamInfo.instructor.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{streamInfo.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{streamInfo.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Par {streamInfo.instructor.name}</span>
                      <span>•</span>
                      <span>Commencé à {streamInfo.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-1" />
                      J'aime
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Partager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Chat ({chatMessages.length})
                </TabsTrigger>
                <TabsTrigger value="qa" className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Q&A ({qaQuestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Chat en direct</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 mb-4">
                      <div className="space-y-3">
                        {chatMessages.map(message => (
                          <div key={message.id} className="group">
                            <div className="flex items-start space-x-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs font-medium ${
                                    message.userRole === 'teacher' ? 'text-blue-600' :
                                    message.userRole === 'moderator' ? 'text-green-600' :
                                    'text-foreground'
                                  }`}>
                                    {message.username}
                                    {message.userRole === 'teacher' && (
                                      <Badge variant="secondary" className="ml-1 text-xs">Prof</Badge>
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                  message.isQuestion ? 'text-blue-600 font-medium' : ''
                                }`}>
                                  {message.isQuestion && '❓ '}{message.message}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => likeMessage(message.id)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                  message.isLiked ? 'text-red-500' : ''
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {message.likes > 0 && <span className="ml-1 text-xs">{message.likes}</span>}
                              </Button>
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
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <Button onClick={sendChatMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qa" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Questions & Réponses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 mb-4">
                      <div className="space-y-4">
                        {qaQuestions.map(question => (
                          <div key={question.id} className="border-l-2 border-muted pl-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium">{question.username}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {question.timestamp.toLocaleTimeString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  {question.isAnswered && (
                                    <Badge variant="secondary" className="text-xs">Répondu</Badge>
                                  )}
                                </div>
                                <p className="text-sm mb-2">{question.question}</p>
                                {question.answer && (
                                  <div className="bg-muted/50 rounded p-2 mt-2">
                                    <p className="text-sm text-blue-600 font-medium mb-1">Réponse:</p>
                                    <p className="text-sm">{question.answer}</p>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => likeQuestion(question.id)}
                                className={question.isLiked ? 'text-red-500' : ''}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {question.likes > 0 && <span className="ml-1 text-xs">{question.likes}</span>}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Posez votre question..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && submitQuestion()}
                      />
                      <Button onClick={submitQuestion} className="w-full" size="sm">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Poser une question
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}