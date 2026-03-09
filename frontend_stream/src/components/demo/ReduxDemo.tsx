import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { setTheme, toggleSidebar, showSuccess, showError } from '../../store/slices/uiSlice';

export function ReduxDemo() {
  const dispatch = useAppDispatch();
  const { login, logout, user, isAuthenticated, isLoading, error } = useAuth();
  const { theme, sidebarOpen, notifications } = useAppSelector(state => state.ui);
  
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = async () => {
    try {
      await login({ email, password });
      dispatch(showSuccess('Connexion réussie !'));
    } catch (err) {
      dispatch(showError('Erreur de connexion'));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(showSuccess('Déconnexion réussie !'));
    } catch (err) {
      dispatch(showError('Erreur de déconnexion'));
    }
  };

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebarDemo = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Redux Demo</h1>
        <p className="text-muted-foreground">
          Testez les fonctionnalités Redux de l'application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Authentication Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
            <CardDescription>
              Testez le système d'authentification Redux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@test.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                  />
                </div>
                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  <p>Comptes de test :</p>
                  <p>• student@test.com / password123</p>
                  <p>• teacher@test.com / password123</p>
                  <p>• admin@test.com / password123</p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Connecté en tant que :</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Rôle : {user?.role}
                  </p>
                </div>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  Se déconnecter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UI State Demo */}
        <Card>
          <CardHeader>
            <CardTitle>État de l'UI</CardTitle>
            <CardDescription>
              Contrôlez l'état global de l'interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Thème actuel : {theme}</p>
              <Button onClick={toggleTheme} variant="outline" className="w-full">
                Basculer vers {theme === 'dark' ? 'clair' : 'sombre'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Sidebar : {sidebarOpen ? 'Ouverte' : 'Fermée'}
              </p>
              <Button onClick={toggleSidebarDemo} variant="outline" className="w-full">
                {sidebarOpen ? 'Fermer' : 'Ouvrir'} la sidebar
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Notifications</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => dispatch(showSuccess('Test de succès !'))}
                  size="sm"
                  variant="outline"
                >
                  Succès
                </Button>
                <Button 
                  onClick={() => dispatch(showError('Test d\'erreur !'))}
                  size="sm"
                  variant="destructive"
                >
                  Erreur
                </Button>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Dernières notifications :
                </p>
                {notifications.slice(-3).map((notif) => (
                  <div key={notif.id} className="text-xs mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {notif.title}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* State Inspector */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Inspecteur d'État Redux</CardTitle>
            <CardDescription>
              Visualisez l'état actuel du store Redux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Auth</h4>
                <div className="text-xs space-y-1">
                  <div>Authentifié: {isAuthenticated ? '✅' : '❌'}</div>
                  <div>Chargement: {isLoading ? '⏳' : '✅'}</div>
                  <div>Utilisateur: {user?.firstName || 'Aucun'}</div>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">UI</h4>
                <div className="text-xs space-y-1">
                  <div>Thème: {theme}</div>
                  <div>Sidebar: {sidebarOpen ? 'Ouverte' : 'Fermée'}</div>
                  <div>Notifications: {notifications.length}</div>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Store</h4>
                <div className="text-xs space-y-1">
                  <div>Redux: ✅ Opérationnel</div>
                  <div>RTK Query: ✅ Configuré</div>
                  <div>Middleware: ✅ Actifs</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}