import { useTranslation } from '../../lib/i18n';
import { useAppSelector } from '../../hooks/redux';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface LiveSessionProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string) => void;
}

export function LiveSession({ courseId, sessionId, onNavigate }: LiveSessionProps) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  // Mock data - will be replaced with real API calls
  const sessionData = {
    id: sessionId,
    title: 'React Hooks Avancés',
    description: 'Session live sur les hooks React avancés',
    isLive: true,
    viewerCount: 47,
    teacher: {
      id: '1',
      name: 'Sarah Martin',
      avatar: null
    },
    startTime: new Date(),
    course: {
      id: courseId,
      title: 'React Avancé'
    }
  };

  const chatMessages = [
    {
      id: '1',
      user: { id: 'teacher', name: 'Sarah (Enseignant)', role: 'teacher' },
      message: 'Bienvenue dans cette session live ! 👋',
      timestamp: new Date(Date.now() - 10000)
    },
    {
      id: '2',
      user: { id: '1', name: 'Pierre', role: 'student' },
      message: 'Merci pour cette excellente explication',
      timestamp: new Date(Date.now() - 8000)
    },
    {
      id: '3',
      user: { id: '2', name: 'Marie', role: 'student' },
      message: 'Pouvez-vous expliquer useEffect à nouveau ?',
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: '4',
      user: { id: '3', name: 'Alex', role: 'student' },
      message: 'Super cours ! 🚀',
      timestamp: new Date(Date.now() - 2000)
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{sessionData.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{sessionData.course.title}</span>
              <Badge variant={sessionData.isLive ? "destructive" : "secondary"}>
                {sessionData.isLive ? 'EN DIRECT' : 'TERMINÉ'}
              </Badge>
              <span>{sessionData.viewerCount} spectateurs</span>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => onNavigate(`/courses/${courseId}`)}
          >
            ← {t('common.back')}
          </Button>
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <h3 className="text-xl mb-2">Session Live</h3>
                  <p className="text-white/80">{sessionData.description}</p>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>EN DIRECT</span>
                    <span>•</span>
                    <span>{sessionData.viewerCount} spectateurs</span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Video Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  📊 Qualité
                </Button>
                <Button variant="outline" size="sm">
                  🔊 Audio
                </Button>
                <Button variant="outline" size="sm">
                  ⚙️ Paramètres
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  ↗️ Plein écran
                </Button>
              </div>
            </div>
          </div>
          
          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Chat en direct</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {chatMessages.length} messages
                </p>
              </div>
              
              {/* Chat Messages */}
              <div className="p-4 h-96 overflow-y-auto">
                <div className="space-y-3">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`p-2 rounded-lg text-sm ${
                        msg.user.role === 'teacher' 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className={`font-medium text-xs mb-1 ${
                        msg.user.role === 'teacher' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {msg.user.name}
                      </div>
                      <div className="text-foreground">{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t">
                {isAuthenticated ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Tapez votre message..."
                      className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                    <Button size="sm">
                      Envoyer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Connectez-vous pour participer au chat
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigate('/auth/signin')}
                    >
                      Se connecter
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        
        {/* Session Info */}
        <div className="mt-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">À propos de cette session</h3>
                <p className="text-muted-foreground mb-4">
                  Dans cette session, nous explorons les hooks React avancés comme useCallback, useMemo, 
                  useReducer et comment créer ses propres hooks personnalisés.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {sessionData.teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{sessionData.teacher.name}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Commencé il y a {Math.floor((Date.now() - sessionData.startTime.getTime()) / 60000)} min
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline"
                  onClick={() => onNavigate(`/courses/${courseId}`)}
                >
                  Voir le cours complet
                </Button>
                {user?.role === 'teacher' && (
                  <Button 
                    variant="outline"
                    onClick={() => onNavigate(`/teacher/live/${courseId}/${sessionId}`)}
                  >
                    Gérer la session
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}