import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus,
  Video,
  Calendar,
  Users,
  Settings,
  Play,
  Square,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Radio,
  Clock,
  Eye,
  Download,
  BarChart3,
  MessageSquare
} from 'lucide-react';
// import { useAuth } from '../../lib/auth';
// import { useApi, type LiveSession, type SessionSettings } from '../../lib/api';

interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  startTime: Date;
  endTime?: Date;
  isLive: boolean;
  viewers: number;
  maxViewers: number;
  settings: SessionSettings;
}

interface SessionSettings {
  allowChat: boolean;
  allowQA: boolean;
  recordSession: boolean;
  isPrivate: boolean;
  quality: 'HD' | 'FHD' | '4K';
  maxViewers: number;
}

interface LiveSessionManagerProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

interface NewSessionData {
  title: string;
  description: string;
  scheduledFor: string;
  settings: SessionSettings;
}

export function LiveSessionManager({ courseId, onNavigate }: LiveSessionManagerProps) {
  // const { getCurrentUser } = useAuth();
  // const { getCourseLiveSessions, createLiveSession, startLiveSession, stopLiveSession } = useApi();
  // const user = getCurrentUser();
  const user = { id: 'teacher-1', name: 'Enseignant' };
  
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize sessions
  useState(() => {
    loadSessions();
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [newSession, setNewSession] = useState<NewSessionData>({
    title: '',
    description: '',
    scheduledFor: '',
    settings: {
      allowChat: true,
      allowQA: true,
      recordSession: true,
      isPrivate: false,
      quality: 'HD',
      maxViewers: 100
    }
  });

  // Mock sessions data
  const loadSessions = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSessions([
        {
          id: '1',
          courseId: 'react-advanced',
          title: 'React Hooks Avancés - Session Live',
          description: 'Session interactive sur les hooks React',
          instructorId: 'teacher-1',
          instructorName: 'Sarah Rodriguez',
          startTime: new Date(),
          isLive: false,
          viewers: 0,
          maxViewers: 100,
          settings: {
            allowChat: true,
            allowQA: true,
            recordSession: true,
            isPrivate: false,
            quality: 'HD',
            maxViewers: 100
          }
        }
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleCreateSession = () => {
    setIsCreating(true);
    
    setTimeout(() => {
      const newSessionData: LiveSession = {
        id: Date.now().toString(),
        courseId,
        title: newSession.title,
        description: newSession.description,
        instructorId: 'teacher-1',
        instructorName: 'Enseignant',
        startTime: new Date(),
        isLive: false,
        viewers: 0,
        maxViewers: newSession.settings.maxViewers,
        settings: newSession.settings
      };
      
      setSessions(prev => [...prev, newSessionData]);
      setShowCreateDialog(false);
      resetNewSession();
      setIsCreating(false);
    }, 500);
  };

  const handleStartSession = (sessionId: string) => {
    console.log('Starting session:', sessionId);
    onNavigate(`/teacher/live/${courseId}/${sessionId}`);
  };

  const handleStopSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isLive: false, endTime: new Date() } : s
    ));
    console.log('Session stopped:', sessionId);
  };

  const resetNewSession = () => {
    setNewSession({
      title: '',
      description: '',
      scheduledFor: '',
      settings: {
        allowChat: true,
        allowQA: true,
        recordSession: true,
        isPrivate: false,
        quality: 'HD',
        maxViewers: 100
      }
    });
  };

  const copySessionLink = (sessionId: string) => {
    const link = `${window.location.origin}/courses/${courseId}/live/${sessionId}`;
    navigator.clipboard.writeText(link);
    alert('Lien copié dans le presse-papiers !');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const getStatusBadge = (session: LiveSession) => {
    if (session.isLive) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          EN DIRECT
        </Badge>
      );
    }
    
    if (session.endTime) {
      return <Badge variant="secondary">Terminé</Badge>;
    }
    
    return <Badge variant="outline">Programmé</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sessions Live</h2>
          <p className="text-muted-foreground">Gérez vos sessions de streaming en direct</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle session live</DialogTitle>
              <DialogDescription>
                Configurez votre session de streaming en direct
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informations de base</TabsTrigger>
                <TabsTrigger value="settings">Paramètres avancés</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de la session</Label>
                  <Input
                    id="title"
                    placeholder="Ex: React Hooks Avancés"
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez le contenu de votre session..."
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduled">Programmée pour (optionnel)</Label>
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={newSession.scheduledFor}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chat">Autoriser le chat</Label>
                    <Switch
                      id="chat"
                      checked={newSession.settings.allowChat}
                      onCheckedChange={(checked) => 
                        setNewSession(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, allowChat: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="qa">Autoriser les Q&A</Label>
                    <Switch
                      id="qa"
                      checked={newSession.settings.allowQA}
                      onCheckedChange={(checked) => 
                        setNewSession(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, allowQA: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="record">Enregistrer la session</Label>
                    <Switch
                      id="record"
                      checked={newSession.settings.recordSession}
                      onCheckedChange={(checked) => 
                        setNewSession(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, recordSession: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="private">Session privée</Label>
                    <Switch
                      id="private"
                      checked={newSession.settings.isPrivate}
                      onCheckedChange={(checked) => 
                        setNewSession(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, isPrivate: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quality">Qualité vidéo</Label>
                    <Select 
                      value={newSession.settings.quality} 
                      onValueChange={(value: 'HD' | 'FHD' | '4K') => 
                        setNewSession(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, quality: value }
                        }))
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
                  
                  <div>
                    <Label htmlFor="maxViewers">Nombre maximum de spectateurs</Label>
                    <Input
                      id="maxViewers"
                      type="number"
                      min="1"
                      max="1000"
                      value={newSession.settings.maxViewers}
                      onChange={(e) => 
                        setNewSession(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, maxViewers: parseInt(e.target.value) || 100 }
                        }))
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleCreateSession} 
                disabled={!newSession.title || isCreating}
              >
                {isCreating ? 'Création...' : 'Créer la session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Chargement des sessions...</p>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune session live</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première session de streaming en direct
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      {getStatusBadge(session)}
                    </div>
                    <p className="text-muted-foreground text-sm">{session.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copySessionLink(session.id)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copier le lien
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/courses/${courseId}/live/${session.id}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(session.startTime)}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {session.viewers} / {session.maxViewers} spectateurs
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Settings className="w-4 h-4 mr-2" />
                    {session.settings.quality} • {session.settings.recordSession ? 'Enregistrée' : 'Non enregistrée'}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {session.settings.allowChat && (
                    <Badge variant="secondary" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </Badge>
                  )}
                  {session.settings.allowQA && (
                    <Badge variant="secondary" className="text-xs">
                      Q&A
                    </Badge>
                  )}
                  {session.settings.isPrivate && (
                    <Badge variant="outline" className="text-xs">
                      Privé
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {session.isLive ? (
                    <>
                      <Button
                        onClick={() => onNavigate(`/teacher/live/${courseId}/${session.id}`)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Aller au studio
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleStopSession(session.id)}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Arrêter
                      </Button>
                    </>
                  ) : session.endTime ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onNavigate(`/teacher/analytics/${session.id}`)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Statistiques
                      </Button>
                      
                      {session.settings.recordSession && (
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button onClick={() => handleStartSession(session.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Démarrer maintenant
                      </Button>
                      
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      
                      <Button variant="outline" className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}