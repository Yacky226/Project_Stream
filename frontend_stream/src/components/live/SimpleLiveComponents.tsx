import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Video, Users, Radio, Eye, ArrowLeft } from 'lucide-react';

interface SimpleLiveStudioProps {
  courseId: string;
  sessionId?: string;
  onNavigate: (path: string) => void;
}

export function SimpleLiveStudio({ courseId, sessionId, onNavigate }: SimpleLiveStudioProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
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
              <p className="text-muted-foreground">Studio de diffusion en direct</p>
            </div>
          </div>
          
          <Badge variant="destructive" className="animate-pulse">
            <Radio className="w-3 h-3 mr-1" />
            SIMULATION
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu vidéo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl mb-2">Studio Live</h3>
                    <p className="text-white/80 mb-4">Simulation du studio de streaming</p>
                    <div className="flex justify-center space-x-4">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Video className="w-4 h-4 mr-2" />
                        Caméra ON
                      </Button>
                      <Button size="sm" variant="outline">
                        Démarrer Live
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Spectateurs</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durée</span>
                    <span className="font-semibold">00:15:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualité</span>
                    <span className="font-semibold">1080p</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded p-3 mb-3">
                  <div className="text-sm space-y-2">
                    <div><strong>Marie:</strong> Excellente explication !</div>
                    <div><strong>Pierre:</strong> Merci pour le cours</div>
                    <div><strong>Alex:</strong> Question sur useState ?</div>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  Gérer le chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SimpleLiveViewerProps {
  courseId: string;
  sessionId: string;
  onNavigate: (path: string) => void;
}

export function SimpleLiveViewer({ courseId, sessionId, onNavigate }: SimpleLiveViewerProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
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
              47 spectateurs
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-lg mb-2">Session Live en cours</h3>
                    <p className="text-white/80">React Hooks Avancés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chat en direct</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded p-3 mb-4 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    <div className="bg-background/50 rounded p-2">
                      <div className="font-medium text-blue-600">Sarah (Prof)</div>
                      <div>Bienvenue dans cette session ! 👋</div>
                    </div>
                    <div className="bg-background/30 rounded p-2">
                      <div className="font-medium">Marie</div>
                      <div>Merci pour cette explication claire</div>
                    </div>
                    <div className="bg-background/30 rounded p-2">
                      <div className="font-medium">Pierre</div>
                      <div>Question sur useEffect ?</div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input 
                    className="flex-1 px-3 py-2 text-sm bg-background border rounded-lg"
                    placeholder="Votre message..."
                  />
                  <Button size="sm">Envoyer</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SimpleLiveManagerProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export function SimpleLiveManager({ courseId, onNavigate }: SimpleLiveManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sessions Live</h2>
        <Button>
          <Video className="w-4 h-4 mr-2" />
          Nouvelle session
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h3 className="font-medium">React Hooks Avancés - Session Live</h3>
                  <p className="text-sm text-muted-foreground">Créé aujourd'hui</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Prêt</Badge>
                <Button 
                  size="sm" 
                  onClick={() => onNavigate(`/teacher/live/${courseId}/demo`)}
                >
                  Démarrer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Créez votre première session</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Démarrez une session live pour interagir avec vos étudiants
            </p>
            <Button>Créer une session</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}