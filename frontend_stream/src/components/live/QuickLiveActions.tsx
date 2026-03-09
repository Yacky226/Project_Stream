import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Video,
  Radio,
  Clock,
  Users,
  Play,
  Eye,
  Plus,
  ExternalLink
} from 'lucide-react';

interface QuickLiveActionsProps {
  onNavigate: (path: string) => void;
}

interface QuickSession {
  id: string;
  courseId: string;
  title: string;
  status: 'live' | 'upcoming' | 'ended';
  viewers: number;
  scheduledTime: Date;
}

export function QuickLiveActions({ onNavigate }: QuickLiveActionsProps) {
  const [showQuickStart, setShowQuickStart] = useState(false);

  // Mock data - À remplacer par des appels API
  const activeSessions: QuickSession[] = [
    {
      id: '1',
      courseId: 'react-advanced',
      title: 'React Hooks Avancés - Session Live',
      status: 'live',
      viewers: 47,
      scheduledTime: new Date(Date.now() - 30 * 60 * 1000) // Started 30 min ago
    }
  ];

  const upcomingSessions: QuickSession[] = [
    {
      id: '2',
      courseId: 'typescript-master',
      title: 'TypeScript Masterclass - Q&A',
      status: 'upcoming',
      viewers: 0,
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // In 2 hours
    }
  ];

  const availableCourses = [
    { id: 'react-advanced', title: 'React Hooks Avancés', students: 156 },
    { id: 'typescript-master', title: 'TypeScript Masterclass', students: 89 },
    { id: 'vue-essentials', title: 'Vue.js Essentials', students: 72 }
  ];

  const handleQuickStart = (courseId: string) => {
    setShowQuickStart(false);
    console.log('Starting live session for course:', courseId);
    onNavigate(`/teacher/live/${courseId}/demo`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Start Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sessions Live</h3>
        <div className="flex space-x-2">
          <Dialog open={showQuickStart} onOpenChange={setShowQuickStart}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Video className="w-4 h-4 mr-2" />
                Démarrer Live
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Démarrer une session live</DialogTitle>
                <DialogDescription>
                  Sélectionnez le cours pour commencer une session en direct
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {availableCourses.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.students} étudiants</p>
                    </div>
                    <Button onClick={() => handleQuickStart(course.id)}>
                      <Play className="w-4 h-4 mr-1" />
                      Démarrer
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => onNavigate('/teacher/live-sessions')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Gérer toutes
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-green-600 flex items-center">
            <Radio className="w-4 h-4 mr-2 animate-pulse" />
            Sessions actives
          </h4>
          {activeSessions.map(session => (
            <Card key={session.id} className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <h5 className="font-medium">{session.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        Commencé à {formatTime(session.scheduledTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      {session.viewers}
                    </div>
                    <Badge variant="destructive">
                      EN DIRECT
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => onNavigate(`/teacher/live/${session.courseId}/${session.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Rejoindre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-blue-600 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Sessions programmées
          </h4>
          {upcomingSessions.map(session => (
            <Card key={session.id} className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <h5 className="font-medium">{session.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        Programmé à {formatTime(session.scheduledTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">
                      À venir
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickStart(session.courseId)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Démarrer maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Sessions State */}
      {activeSessions.length === 0 && upcomingSessions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">Aucune session active</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Démarrez une session live pour interagir avec vos étudiants en temps réel
            </p>
            <Button onClick={() => setShowQuickStart(true)}>
              <Video className="w-4 h-4 mr-2" />
              Démarrer une session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}