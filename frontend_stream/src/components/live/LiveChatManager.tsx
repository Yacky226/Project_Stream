import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Hand,
  MoreVertical,
  Ban,
  Shield,
  Volume2,
  VolumeX,
  Filter,
  Search,
  Flag,
  Pin,
  Heart,
  Smile,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'question' | 'announcement' | 'system';
  isFromTeacher: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  reactions?: {
    likes: number;
    hearts: number;
    laughs: number;
  };
  userReaction?: string;
  isModerated?: boolean;
  isFlagged?: boolean;
  replies?: ChatMessage[];
}

interface ChatSettings {
  enableChat: boolean;
  allowStudentMessages: boolean;
  allowQuestions: boolean;
  requireModeration: boolean;
  allowEmojis: boolean;
  slowMode: number; // seconds
  maxMessageLength: number;
  bannedWords: string[];
}

interface LiveChatManagerProps {
  isTeacher: boolean;
  sessionId: string;
  onSendMessage?: (message: string, type: 'message' | 'question') => void;
}

export function LiveChatManager({ isTeacher, sessionId, onSendMessage }: LiveChatManagerProps) {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'teacher',
      username: 'Sarah Martin',
      message: 'Bienvenue dans cette session de React Hooks Avancés ! 👋',
      timestamp: new Date(Date.now() - 900000),
      type: 'announcement',
      isFromTeacher: true,
      isPinned: true,
      reactions: { likes: 12, hearts: 5, laughs: 0 },
      userReaction: 'likes'
    },
    {
      id: '2',
      userId: 'student1',
      username: 'Marie Dupont',
      message: 'Merci ! Très hâte de commencer cette session',
      timestamp: new Date(Date.now() - 840000),
      type: 'message',
      isFromTeacher: false,
      reactions: { likes: 3, hearts: 1, laughs: 0 }
    },
    {
      id: '3',
      userId: 'student2',
      username: 'Pierre Martin',
      message: 'Est-ce que nous allons voir useEffect dans cette session ?',
      timestamp: new Date(Date.now() - 780000),
      type: 'question',
      isFromTeacher: false,
      reactions: { likes: 8, hearts: 2, laughs: 0 },
      isHighlighted: true
    },
    {
      id: '4',
      userId: 'teacher',
      username: 'Sarah Martin',
      message: 'Excellente question Pierre ! Oui, nous couvrirons useEffect en détail dans la seconde partie.',
      timestamp: new Date(Date.now() - 720000),
      type: 'message',
      isFromTeacher: true,
      reactions: { likes: 15, hearts: 3, laughs: 0 }
    },
    {
      id: '5',
      userId: 'student3',
      username: 'Alex Chen',
      message: 'Super ! Merci d\'avance pour les explications 🚀',
      timestamp: new Date(Date.now() - 660000),
      type: 'message',
      isFromTeacher: false,
      reactions: { likes: 4, hearts: 2, laughs: 1 }
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'message' | 'question'>('message');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'questions' | 'announcements' | 'flagged'>('all');
  
  // Chat settings
  const [settings, setSettings] = useState<ChatSettings>({
    enableChat: true,
    allowStudentMessages: true,
    allowQuestions: true,
    requireModeration: false,
    allowEmojis: true,
    slowMode: 0,
    maxMessageLength: 500,
    bannedWords: []
  });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [moderationQueue, setModerationQueue] = useState<ChatMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [canSendMessage, setCanSendMessage] = useState(true);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle slow mode
  useEffect(() => {
    if (settings.slowMode > 0 && lastMessageTime) {
      setCanSendMessage(false);
      const timer = setTimeout(() => {
        setCanSendMessage(true);
      }, settings.slowMode * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [lastMessageTime, settings.slowMode]);
  
  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (selectedFilter === 'questions' && msg.type !== 'question') return false;
    if (selectedFilter === 'announcements' && msg.type !== 'announcement') return false;
    if (selectedFilter === 'flagged' && !msg.isFlagged) return false;
    if (searchQuery && !msg.message.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !msg.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Get pinned messages
  useEffect(() => {
    setPinnedMessages(messages.filter(msg => msg.isPinned));
  }, [messages]);
  
  // Handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !canSendMessage) return;
    
    if (newMessage.length > settings.maxMessageLength) {
      alert(`Message trop long. Maximum ${settings.maxMessageLength} caractères.`);
      return;
    }
    
    // Check for banned words
    const hasBannedWord = settings.bannedWords.some(word => 
      newMessage.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hasBannedWord) {
      alert('Votre message contient des mots interdits.');
      return;
    }
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: isTeacher ? 'teacher' : 'currentUser',
      username: isTeacher ? 'Vous (Enseignant)' : 'Vous',
      message: newMessage,
      timestamp: new Date(),
      type: messageType,
      isFromTeacher: isTeacher,
      reactions: { likes: 0, hearts: 0, laughs: 0 }
    };
    
    if (settings.requireModeration && !isTeacher) {
      setModerationQueue(prev => [...prev, message]);
    } else {
      setMessages(prev => [...prev, message]);
    }
    
    setNewMessage('');
    setMessageType('message');
    setLastMessageTime(new Date());
    
    onSendMessage?.(newMessage, messageType);
  };
  
  const handleReaction = (messageId: string, reaction: 'likes' | 'hearts' | 'laughs') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const currentReaction = msg.userReaction;
        const reactions = { ...msg.reactions } || { likes: 0, hearts: 0, laughs: 0 };
        
        // Remove previous reaction
        if (currentReaction) {
          reactions[currentReaction as keyof typeof reactions]--;
        }
        
        // Add new reaction if different
        let newUserReaction = undefined;
        if (currentReaction !== reaction) {
          reactions[reaction]++;
          newUserReaction = reaction;
        }
        
        return {
          ...msg,
          reactions,
          userReaction: newUserReaction
        };
      }
      return msg;
    }));
  };
  
  const handlePinMessage = (messageId: string) => {
    if (!isTeacher) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };
  
  const handleDeleteMessage = (messageId: string) => {
    if (!isTeacher) return;
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };
  
  const handleFlagMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isFlagged: !msg.isFlagged } : msg
    ));
  };
  
  const handleHighlightMessage = (messageId: string) => {
    if (!isTeacher) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isHighlighted: !msg.isHighlighted } : msg
    ));
  };
  
  const approveModerationMessage = (messageId: string) => {
    const message = moderationQueue.find(msg => msg.id === messageId);
    if (message) {
      setMessages(prev => [...prev, message]);
      setModerationQueue(prev => prev.filter(msg => msg.id !== messageId));
    }
  };
  
  const rejectModerationMessage = (messageId: string) => {
    setModerationQueue(prev => prev.filter(msg => msg.id !== messageId));
  };
  
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <Hand className="w-3 h-3" />;
      case 'announcement':
        return <Pin className="w-3 h-3" />;
      case 'system':
        return <Settings className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };
  
  const getMessageStyle = (msg: ChatMessage) => {
    let baseClasses = 'p-3 rounded-lg text-sm';
    
    if (msg.isPinned) {
      baseClasses += ' ring-2 ring-blue-200 dark:ring-blue-800';
    }
    
    if (msg.isHighlighted) {
      baseClasses += ' bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500';
    } else if (msg.isFromTeacher) {
      baseClasses += ' bg-blue-50 dark:bg-blue-950/20 border-l-2 border-blue-500';
    } else if (msg.type === 'question') {
      baseClasses += ' bg-orange-50 dark:bg-orange-950/20 border-l-2 border-orange-500';
    } else if (msg.type === 'announcement') {
      baseClasses += ' bg-green-50 dark:bg-green-950/20 border-l-2 border-green-500';
    } else {
      baseClasses += ' bg-muted';
    }
    
    if (msg.isFlagged) {
      baseClasses += ' ring-1 ring-red-300 dark:ring-red-700';
    }
    
    return baseClasses;
  };
  
  return (
    <div className="space-y-4">
      {/* Chat Header with Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat en direct
              <Badge variant="secondary" className="ml-2">
                {messages.length} messages
              </Badge>
            </CardTitle>
            
            {isTeacher && (
              <div className="flex items-center space-x-2">
                {moderationQueue.length > 0 && (
                  <Badge variant="destructive">
                    {moderationQueue.length} en modération
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        {/* Chat Settings (Teacher only) */}
        {isTeacher && showSettings && (
          <CardContent className="border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Chat activé</span>
                <Switch
                  checked={settings.enableChat}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableChat: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Messages étudiants</span>
                <Switch
                  checked={settings.allowStudentMessages}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowStudentMessages: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Questions autorisées</span>
                <Switch
                  checked={settings.allowQuestions}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowQuestions: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Modération requise</span>
                <Switch
                  checked={settings.requireModeration}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireModeration: checked }))}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Mode lent (secondes)</label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.slowMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, slowMode: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium">Limite caractères</label>
                <Input
                  type="number"
                  min="50"
                  max="1000"
                  value={settings.maxMessageLength}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxMessageLength: parseInt(e.target.value) || 500 }))}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Pin className="w-4 h-4 mr-2" />
              Messages épinglés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pinnedMessages.map(msg => (
              <div key={`pinned-${msg.id}`} className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                <div className="font-medium flex items-center">
                  {getMessageIcon(msg.type)}
                  <span className="ml-2">{msg.username}</span>
                </div>
                <div>{msg.message}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Moderation Queue (Teacher only) */}
      {isTeacher && moderationQueue.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              File de modération ({moderationQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {moderationQueue.map(msg => (
              <div key={`mod-${msg.id}`} className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{msg.username}</div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveModerationMessage(msg.id)}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectModerationMessage(msg.id)}
                    >
                      <Ban className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Main Chat */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedFilter('all')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Tous les messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter('questions')}>
                  <Hand className="w-4 h-4 mr-2" />
                  Questions seulement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter('announcements')}>
                  <Pin className="w-4 h-4 mr-2" />
                  Annonces
                </DropdownMenuItem>
                {isTeacher && (
                  <DropdownMenuItem onClick={() => setSelectedFilter('flagged')}>
                    <Flag className="w-4 h-4 mr-2" />
                    Messages signalés
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea className="h-96 p-4" ref={chatScrollRef}>
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div key={message.id} className="group">
                  <div className={getMessageStyle(message)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {getMessageIcon(message.type)}
                          <span className="font-medium">{message.username}</span>
                        </div>
                        
                        {message.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
                        {message.isFlagged && <Flag className="w-3 h-3 text-red-500" />}
                        
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {/* Message actions */}
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
                          {!message.isFromTeacher && (
                            <DropdownMenuItem onClick={() => handleFlagMessage(message.id)}>
                              <Flag className="w-3 h-3 mr-2" />
                              {message.isFlagged ? 'Retirer le signalement' : 'Signaler'}
                            </DropdownMenuItem>
                          )}
                          
                          {isTeacher && (
                            <>
                              <DropdownMenuItem onClick={() => handlePinMessage(message.id)}>
                                <Pin className="w-3 h-3 mr-2" />
                                {message.isPinned ? 'Désépingler' : 'Épingler'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleHighlightMessage(message.id)}>
                                <Eye className="w-3 h-3 mr-2" />
                                {message.isHighlighted ? 'Enlever surbrillance' : 'Mettre en surbrillance'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-destructive"
                              >
                                <Ban className="w-3 h-3 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mb-2">{message.message}</div>
                    
                    {/* Reactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReaction(message.id, 'likes')}
                          className={`h-6 px-2 ${message.userReaction === 'likes' ? 'text-blue-600' : 'text-muted-foreground'}`}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {message.reactions?.likes || 0}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReaction(message.id, 'hearts')}
                          className={`h-6 px-2 ${message.userReaction === 'hearts' ? 'text-red-600' : 'text-muted-foreground'}`}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {message.reactions?.hearts || 0}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReaction(message.id, 'laughs')}
                          className={`h-6 px-2 ${message.userReaction === 'laughs' ? 'text-yellow-600' : 'text-muted-foreground'}`}
                        >
                          <Smile className="w-3 h-3 mr-1" />
                          {message.reactions?.laughs || 0}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Message input */}
          {settings.enableChat && (settings.allowStudentMessages || isTeacher) && (
            <div className="border-t p-4">
              {/* Slow mode warning */}
              {settings.slowMode > 0 && !canSendMessage && (
                <Alert className="mb-3">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Mode lent activé. Attendez {settings.slowMode} secondes entre chaque message.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                {/* Message type selector */}
                {settings.allowQuestions && (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="radio"
                        name="messageType"
                        value="message"
                        checked={messageType === 'message'}
                        onChange={(e) => setMessageType(e.target.value as 'message')}
                        className="rounded"
                      />
                      <span>Message</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="radio"
                        name="messageType"
                        value="question"
                        checked={messageType === 'question'}
                        onChange={(e) => setMessageType(e.target.value as 'question')}
                        className="rounded"
                      />
                      <span>Question</span>
                    </label>
                  </div>
                )}
                
                {/* Message input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder={
                      messageType === 'question' 
                        ? "Posez votre question..." 
                        : "Tapez votre message..."
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!canSendMessage}
                    maxLength={settings.maxMessageLength}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!canSendMessage || !newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {newMessage.length}/{settings.maxMessageLength} caractères
                  </span>
                  {settings.slowMode > 0 && (
                    <span>Mode lent: {settings.slowMode}s</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!settings.enableChat && (
            <div className="border-t p-4 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Le chat est désactivé pour cette session</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}