import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Hand,
  Check,
  X,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Users,
  AlertTriangle,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Search,
  Timer,
  User,
  CheckCircle,
  XCircle
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
import { Slider } from '../ui/slider';

interface HandRaiseRequest {
  id: string;
  userId: string;
  username: string;
  timestamp: Date;
  reason?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'denied' | 'expired';
  speakingTime?: number; // seconds granted
  actualSpeakingTime?: number; // seconds used
  isUrgent?: boolean;
  category?: 'question' | 'comment' | 'technical' | 'other';
}

interface SpeakingSession {
  id: string;
  userId: string;
  username: string;
  startTime: Date;
  maxDuration: number; // seconds
  currentDuration: number;
  isActive: boolean;
  isMuted: boolean;
}

interface HandRaiseSettings {
  enableHandRaise: boolean;
  requireReason: boolean;
  autoExpireAfter: number; // minutes
  maxSpeakingTime: number; // seconds
  allowMultipleRaises: boolean;
  prioritizeQuestions: boolean;
  notifySound: boolean;
}

interface HandRaiseManagerProps {
  isTeacher: boolean;
  sessionId: string;
  onHandRaiseChange?: (count: number) => void;
  onGrantSpeaking?: (userId: string, duration: number) => void;
  onRevokeSpeaking?: (userId: string) => void;
}

export function HandRaiseManager({ 
  isTeacher, 
  sessionId, 
  onHandRaiseChange,
  onGrantSpeaking,
  onRevokeSpeaking
}: HandRaiseManagerProps) {
  // Hand raise state
  const [handRaises, setHandRaises] = useState<HandRaiseRequest[]>([
    {
      id: '1',
      userId: 'student1',
      username: 'Marie Dupont',
      timestamp: new Date(Date.now() - 180000),
      reason: 'Question sur les hooks personnalisés',
      priority: 'high',
      status: 'pending',
      category: 'question',
      isUrgent: true
    },
    {
      id: '2',
      userId: 'student2',
      username: 'Pierre Martin',
      timestamp: new Date(Date.now() - 120000),
      reason: 'Problème technique avec l\'audio',
      priority: 'high',
      status: 'pending',
      category: 'technical',
      isUrgent: true
    },
    {
      id: '3',
      userId: 'student3',
      username: 'Alex Chen',
      timestamp: new Date(Date.now() - 60000),
      reason: 'Commentaire sur l\'exemple précédent',
      priority: 'medium',
      status: 'pending',
      category: 'comment'
    }
  ]);
  
  // Speaking sessions
  const [speakingSessions, setSpeakingSessions] = useState<SpeakingSession[]>([]);
  
  // Settings
  const [settings, setSettings] = useState<HandRaiseSettings>({
    enableHandRaise: true,
    requireReason: true,
    autoExpireAfter: 5,
    maxSpeakingTime: 120,
    allowMultipleRaises: false,
    prioritizeQuestions: true,
    notifySound: true
  });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'question' | 'comment' | 'technical' | 'other'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'category'>('timestamp');
  
  // Student hand raise state
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [handRaiseReason, setHandRaiseReason] = useState('');
  const [handRaiseCategory, setHandRaiseCategory] = useState<'question' | 'comment' | 'technical' | 'other'>('question');
  const [isUrgent, setIsUrgent] = useState(false);
  const [currentHandRaise, setCurrentHandRaise] = useState<HandRaiseRequest | null>(null);
  
  // Auto-expire hand raises
  useEffect(() => {
    if (settings.autoExpireAfter > 0) {
      const interval = setInterval(() => {
        const now = new Date();
        setHandRaises(prev => prev.map(hr => {
          const minutesPassed = (now.getTime() - hr.timestamp.getTime()) / (1000 * 60);
          if (minutesPassed > settings.autoExpireAfter && hr.status === 'pending') {
            return { ...hr, status: 'expired' };
          }
          return hr;
        }));
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [settings.autoExpireAfter]);
  
  // Update speaking session timers
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeakingSessions(prev => prev.map(session => {
        if (session.isActive) {
          const elapsed = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
          const newDuration = Math.min(elapsed, session.maxDuration);
          
          // Auto-revoke if time exceeded
          if (newDuration >= session.maxDuration) {
            onRevokeSpeaking?.(session.userId);
            return { ...session, currentDuration: newDuration, isActive: false };
          }
          
          return { ...session, currentDuration: newDuration };
        }
        return session;
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Notify parent of hand raise count changes
  useEffect(() => {
    const pendingCount = handRaises.filter(hr => hr.status === 'pending').length;
    onHandRaiseChange?.(pendingCount);
  }, [handRaises, onHandRaiseChange]);
  
  // Filter and sort hand raises
  const filteredHandRaises = handRaises
    .filter(hr => {
      if (hr.status !== 'pending') return false;
      if (filterCategory !== 'all' && hr.category !== filterCategory) return false;
      if (filterPriority !== 'all' && hr.priority !== filterPriority) return false;
      if (searchQuery && !hr.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !hr.reason?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'category') {
        return (a.category || 'other').localeCompare(b.category || 'other');
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
    });
  
  // Handlers
  const handleRaiseHand = () => {
    if (!settings.enableHandRaise) return;
    
    if (isHandRaised) {
      // Lower hand
      setIsHandRaised(false);
      setCurrentHandRaise(null);
      setHandRaises(prev => prev.filter(hr => hr.userId !== 'currentUser'));
    } else {
      // Raise hand
      if (settings.requireReason && !handRaiseReason.trim()) {
        alert('Veuillez indiquer une raison pour lever la main.');
        return;
      }
      
      const newHandRaise: HandRaiseRequest = {
        id: Date.now().toString(),
        userId: 'currentUser',
        username: 'Vous',
        timestamp: new Date(),
        reason: handRaiseReason,
        priority: isUrgent ? 'high' : 'medium',
        status: 'pending',
        category: handRaiseCategory,
        isUrgent
      };
      
      setHandRaises(prev => [...prev, newHandRaise]);
      setCurrentHandRaise(newHandRaise);
      setIsHandRaised(true);
      setHandRaiseReason('');
      setIsUrgent(false);
    }
  };
  
  const handleApproveHandRaise = (handRaiseId: string, speakingTime?: number) => {
    const handRaise = handRaises.find(hr => hr.id === handRaiseId);
    if (!handRaise) return;
    
    const duration = speakingTime || settings.maxSpeakingTime;
    
    // Create speaking session
    const speakingSession: SpeakingSession = {
      id: Date.now().toString(),
      userId: handRaise.userId,
      username: handRaise.username,
      startTime: new Date(),
      maxDuration: duration,
      currentDuration: 0,
      isActive: true,
      isMuted: false
    };
    
    setSpeakingSessions(prev => [...prev, speakingSession]);
    setHandRaises(prev => prev.map(hr => 
      hr.id === handRaiseId ? { ...hr, status: 'approved', speakingTime: duration } : hr
    ));
    
    onGrantSpeaking?.(handRaise.userId, duration);
  };
  
  const handleDenyHandRaise = (handRaiseId: string) => {
    setHandRaises(prev => prev.map(hr => 
      hr.id === handRaiseId ? { ...hr, status: 'denied' } : hr
    ));
  };
  
  const handleEndSpeaking = (sessionId: string) => {
    const session = speakingSessions.find(s => s.id === sessionId);
    if (session) {
      setSpeakingSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, isActive: false } : s
      ));
      onRevokeSpeaking?.(session.userId);
    }
  };
  
  const handleMuteSpeaker = (sessionId: string) => {
    setSpeakingSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isMuted: !s.isMuted } : s
    ));
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };
  
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'question':
        return <MessageSquare className="w-3 h-3" />;
      case 'technical':
        return <Settings className="w-3 h-3" />;
      case 'comment':
        return <User className="w-3 h-3" />;
      default:
        return <Hand className="w-3 h-3" />;
    }
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getTimeRemaining = (session: SpeakingSession) => {
    return Math.max(0, session.maxDuration - session.currentDuration);
  };
  
  return (
    <div className="space-y-4">
      {/* Teacher View */}
      {isTeacher && (
        <>
          {/* Settings Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Hand className="w-5 h-5 mr-2" />
                  Gestion des mains levées
                  {filteredHandRaises.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {filteredHandRaises.length}
                    </Badge>
                  )}
                </CardTitle>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            {showSettings && (
              <CardContent className="border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mains levées activées</span>
                    <Switch
                      checked={settings.enableHandRaise}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableHandRaise: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Raison obligatoire</span>
                    <Switch
                      checked={settings.requireReason}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireReason: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prioriser questions</span>
                    <Switch
                      checked={settings.prioritizeQuestions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, prioritizeQuestions: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Son de notification</span>
                    <Switch
                      checked={settings.notifySound}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifySound: checked }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Expiration automatique (minutes)</label>
                    <Slider
                      value={[settings.autoExpireAfter]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, autoExpireAfter: value }))}
                      max={30}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {settings.autoExpireAfter === 0 ? 'Jamais' : `${settings.autoExpireAfter} minutes`}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Temps de parole max (secondes)</label>
                    <Slider
                      value={[settings.maxSpeakingTime]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, maxSpeakingTime: value }))}
                      max={300}
                      min={30}
                      step={15}
                      className="mt-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDuration(settings.maxSpeakingTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Active Speaking Sessions */}
          {speakingSessions.filter(s => s.isActive).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Mic className="w-4 h-4 mr-2" />
                  Sessions de parole actives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {speakingSessions.filter(s => s.isActive).map(session => (
                  <div key={session.id} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium">
                          {session.username.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{session.username}</div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2">
                            <Timer className="w-3 h-3" />
                            <span>{formatDuration(session.currentDuration)} / {formatDuration(session.maxDuration)}</span>
                            <span>•</span>
                            <span className="text-orange-600">
                              {formatDuration(getTimeRemaining(session))} restant
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={session.isMuted ? "destructive" : "outline"}
                          onClick={() => handleMuteSpeaker(session.id)}
                        >
                          {session.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEndSpeaking(session.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-green-600 h-1 rounded-full transition-all"
                        style={{ width: `${(session.currentDuration / session.maxDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Hand Raises Queue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">File d'attente des mains levées</CardTitle>
              
              {/* Filters */}
              <div className="flex items-center space-x-2 mt-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Catégorie</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filterCategory === 'all'}
                      onCheckedChange={() => setFilterCategory('all')}
                    >
                      Toutes
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterCategory === 'question'}
                      onCheckedChange={() => setFilterCategory('question')}
                    >
                      Questions
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterCategory === 'comment'}
                      onCheckedChange={() => setFilterCategory('comment')}
                    >
                      Commentaires
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterCategory === 'technical'}
                      onCheckedChange={() => setFilterCategory('technical')}
                    >
                      Technique
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Priorité</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filterPriority === 'all'}
                      onCheckedChange={() => setFilterPriority('all')}
                    >
                      Toutes
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterPriority === 'high'}
                      onCheckedChange={() => setFilterPriority('high')}
                    >
                      Haute
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterPriority === 'medium'}
                      onCheckedChange={() => setFilterPriority('medium')}
                    >
                      Moyenne
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterPriority === 'low'}
                      onCheckedChange={() => setFilterPriority('low')}
                    >
                      Basse
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-64">
                {filteredHandRaises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hand className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune main levée</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-3">
                    {filteredHandRaises.map(handRaise => (
                      <div key={handRaise.id} className={`p-3 rounded-lg border ${getPriorityColor(handRaise.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(handRaise.category)}
                              <span className="font-medium text-sm">{handRaise.username}</span>
                            </div>
                            
                            <Badge variant="outline" className="text-xs">
                              {handRaise.category}
                            </Badge>
                            
                            {handRaise.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {Math.floor((Date.now() - handRaise.timestamp.getTime()) / 60000)}min
                            </span>
                          </div>
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
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Autoriser
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDenyHandRaise(handRaise.id)}
                            className="flex-1"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Student View */}
      {!isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Hand className="w-5 h-5 mr-2" />
              Demande de parole
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentHandRaise ? (
              <Alert>
                <Hand className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Votre main est levée</p>
                      <p className="text-sm text-muted-foreground">
                        {currentHandRaise.reason && `Raison: ${currentHandRaise.reason}`}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleRaiseHand}>
                      Baisser la main
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {settings.requireReason && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Raison (obligatoire)
                    </label>
                    <Textarea
                      placeholder="Expliquez pourquoi vous souhaitez prendre la parole..."
                      value={handRaiseReason}
                      onChange={(e) => setHandRaiseReason(e.target.value)}
                      maxLength={200}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {handRaiseReason.length}/200 caractères
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['question', 'comment', 'technical', 'other'] as const).map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={handRaiseCategory === category}
                          onChange={(e) => setHandRaiseCategory(e.target.value as any)}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="urgent" className="text-sm">
                    Marquer comme urgent
                  </label>
                </div>
                
                <Button 
                  onClick={handleRaiseHand}
                  disabled={!settings.enableHandRaise || (settings.requireReason && !handRaiseReason.trim())}
                  className="w-full"
                >
                  <Hand className="w-4 h-4 mr-2" />
                  Lever la main
                </Button>
              </div>
            )}
            
            {!settings.enableHandRaise && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Les demandes de parole sont désactivées pour cette session.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}