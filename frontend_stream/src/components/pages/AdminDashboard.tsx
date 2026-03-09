import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Users, 
  BookOpen, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash,
  Ban,
  Eye,
  Settings,
  Bell,
  Activity,
  UserCheck,
  UserX,
  BarChart,
  Download,
  Upload
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin: string;
  coursesCount?: number;
  studentsCount?: number;
}

interface Course {
  id: string;
  title: string;
  teacher: string;
  students: number;
  category: string;
  status: 'published' | 'draft' | 'under_review';
  createdAt: string;
  rating: number;
  revenue: number;
}

interface SystemStat {
  label: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Handler functions
  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action ${action} on user ${userId}`);
    // TODO: Implement actual user management
    switch (action) {
      case 'ban':
        // Ban user logic
        alert(`Utilisateur ${userId} banni`);
        break;
      case 'delete':
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
          alert(`Utilisateur ${userId} supprimé`);
        }
        break;
      default:
        break;
    }
  };

  const handleCourseAction = (courseId: string, action: string) => {
    console.log(`Action ${action} on course ${courseId}`);
    // TODO: Implement actual course management
    switch (action) {
      case 'approve':
        alert(`Cours ${courseId} approuvé`);
        break;
      case 'reject':
        alert(`Cours ${courseId} rejeté`);
        break;
      case 'delete':
        if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
          alert(`Cours ${courseId} supprimé`);
        }
        break;
      default:
        break;
    }
  };

  const handleExportData = () => {
    // Create CSV data
    const csvData = [
      ['Nom', 'Email', 'Rôle', 'Statut', 'Date inscription'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        new Date(user.joinDate).toLocaleDateString('fr-FR')
      ])
    ];
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleAddUser = () => {
    setShowUserModal(true);
  };

  const handleCreateUser = (userData: any) => {
    console.log('Creating user:', userData);
    // TODO: Implement actual user creation
    alert(`Utilisateur ${userData.firstName} ${userData.lastName} créé avec succès !`);
    setShowUserModal(false);
  };

  // Mock data - À remplacer par des appels API
  const users: User[] = [
    {
      id: '1',
      name: 'Sarah Martin',
      email: 'sarah.martin@example.com',
      role: 'teacher',
      avatar: '/api/placeholder/40/40',
      status: 'active',
      joinDate: '2023-09-15',
      lastLogin: '2024-01-19T10:30:00Z',
      coursesCount: 3,
      studentsCount: 245
    },
    {
      id: '2',
      name: 'Pierre Dubois',
      email: 'pierre.dubois@example.com',
      role: 'student',
      avatar: '/api/placeholder/40/40',
      status: 'active',
      joinDate: '2023-11-20',
      lastLogin: '2024-01-18T15:45:00Z'
    },
    {
      id: '3',
      name: 'Marie Leroux',
      email: 'marie.leroux@example.com',
      role: 'teacher',
      avatar: '/api/placeholder/40/40',
      status: 'inactive',
      joinDate: '2023-08-10',
      lastLogin: '2024-01-10T09:15:00Z',
      coursesCount: 1,
      studentsCount: 67
    },
    {
      id: '4',
      name: 'Thomas Dubois',
      email: 'thomas.dubois@example.com',
      role: 'student',
      avatar: '/api/placeholder/40/40',
      status: 'banned',
      joinDate: '2023-12-01',
      lastLogin: '2024-01-05T14:20:00Z'
    }
  ];

  const courses: Course[] = [
    {
      id: '1',
      title: 'React Hooks Avancés',
      teacher: 'Sarah Martin',
      students: 156,
      category: 'Frontend',
      status: 'published',
      createdAt: '2023-10-15',
      rating: 4.8,
      revenue: 3120
    },
    {
      id: '2',
      title: 'TypeScript Masterclass',
      teacher: 'Sarah Martin',
      students: 89,
      category: 'Backend',
      status: 'published',
      createdAt: '2023-11-20',
      rating: 4.9,
      revenue: 2225
    },
    {
      id: '3',
      title: 'Vue.js Fondamentaux',
      teacher: 'Marie Leroux',
      students: 67,
      category: 'Frontend',
      status: 'under_review',
      createdAt: '2024-01-10',
      rating: 0,
      revenue: 0
    }
  ];

  const systemStats: SystemStat[] = [
    {
      label: 'Utilisateurs totaux',
      value: 1247,
      change: '+12%',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Enseignants actifs',
      value: 23,
      change: '+3',
      icon: UserCheck,
      color: 'text-green-500'
    },
    {
      label: 'Cours publiés',
      value: 89,
      change: '+8%',
      icon: BookOpen,
      color: 'text-purple-500'
    },
    {
      label: 'Revenus ce mois',
      value: '15,240€',
      change: '+18%',
      icon: TrendingUp,
      color: 'text-emerald-500'
    },
    {
      label: 'Problèmes signalés',
      value: 3,
      change: '-2',
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      label: 'Taux de satisfaction',
      value: '94%',
      change: '+2%',
      icon: Activity,
      color: 'text-pink-500'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === 'all' || user.role === userFilter || user.status === userFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredCourses = courses.filter(course => {
    const matchesFilter = courseFilter === 'all' || course.status === courseFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });



  const handleSendNotification = (data: any) => {
    console.log('Sending notification:', data);
    setShowNotificationModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">{t('admin.dashboard')}</h1>
          <p className="text-muted-foreground">
            Administration de la plateforme Stream Éducatif
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="w-4 h-4 mr-2" />
                Notification globale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Envoyer une notification</DialogTitle>
                <DialogDescription>
                  Diffuser un message à tous les utilisateurs de la plateforme
                </DialogDescription>
              </DialogHeader>
              <NotificationForm onSubmit={handleSendNotification} onCancel={() => setShowNotificationModal(false)} />
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter données
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      <div className="mb-6 space-y-2">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            3 problèmes nécessitent votre attention. <Button variant="link" className="p-0 h-auto">Voir les détails</Button>
          </AlertDescription>
        </Alert>
      </div>

      {/* Debug Panel */}
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Debug Info - Role Tests</h3>
        <div className="flex gap-2 mb-2">
          <Button size="sm" onClick={() => {
            const testUser = { id: '1', email: 'student@test.com', firstName: 'Test', lastName: 'Student', role: 'student' as const, timezone: 'UTC+1' };
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentUser', JSON.stringify(testUser));
              window.location.reload();
            }
          }}>
            Test Student
          </Button>
          <Button size="sm" onClick={() => {
            const testUser = { id: '2', email: 'teacher@test.com', firstName: 'Test', lastName: 'Teacher', role: 'teacher' as const, timezone: 'UTC+1' };
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentUser', JSON.stringify(testUser));
              window.location.reload();
            }
          }}>
            Test Teacher
          </Button>
          <Button size="sm" onClick={() => {
            const testUser = { id: '3', email: 'admin@test.com', firstName: 'Test', lastName: 'Admin', role: 'admin' as const, timezone: 'UTC+1' };
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentUser', JSON.stringify(testUser));
              window.location.reload();
            }
          }}>
            Test Admin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {systemStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="courses">Cours</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Platform Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité de la plateforme</CardTitle>
                <CardDescription>Dernières 24 heures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Nouvelles inscriptions</span>
                    <Badge>+12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cours créés</span>
                    <Badge>+3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sessions live</span>
                    <Badge>+7</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenus générés</span>
                    <Badge variant="outline">+847€</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Meilleurs enseignants</CardTitle>
                <CardDescription>Classement ce mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(u => u.role === 'teacher').slice(0, 3).map((teacher, index) => (
                    <div key={teacher.id} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.studentsCount} étudiants</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>État du système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Serveurs</span>
                    <span className="text-sm text-green-600">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Base de données</span>
                    <span className="text-sm text-green-600">98.7%</span>
                  </div>
                  <Progress value={98.7} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CDN</span>
                    <span className="text-sm text-yellow-600">95.2%</span>
                  </div>
                  <Progress value={95.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Streaming</span>
                    <span className="text-sm text-green-600">99.5%</span>
                  </div>
                  <Progress value={99.5} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="student">Étudiants</SelectItem>
                <SelectItem value="teacher">Enseignants</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="banned">Bannis</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button onClick={handleAddUser}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Statistiques</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'}>
                          {user.role === 'teacher' ? 'Enseignant' : 'Étudiant'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.status === 'active' ? 'default' :
                          user.status === 'inactive' ? 'secondary' : 'destructive'
                        }>
                          {user.status === 'active' ? 'Actif' :
                           user.status === 'inactive' ? 'Inactif' : 'Banni'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.joinDate).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{new Date(user.lastLogin).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        {user.role === 'teacher' ? (
                          <div className="text-sm">
                            <div>{user.coursesCount} cours</div>
                            <div className="text-muted-foreground">{user.studentsCount} étudiants</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.status !== 'banned' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleUserAction(user.id, 'ban')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Course Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="under_review">En attente</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Courses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Cours ({filteredCourses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cours</TableHead>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Étudiants</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Revenus</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">{course.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>{course.teacher}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>
                        <Badge variant={
                          course.status === 'published' ? 'default' :
                          course.status === 'under_review' ? 'secondary' : 'outline'
                        }>
                          {course.status === 'published' ? 'Publié' :
                           course.status === 'under_review' ? 'En attente' : 'Brouillon'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {course.rating > 0 ? `${course.rating}/5` : '-'}
                      </TableCell>
                      <TableCell>{course.revenue}€</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => onNavigate(`/courses/${course.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {course.status === 'under_review' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleCourseAction(course.id, 'approve')}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleCourseAction(course.id, 'reject')}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCourseAction(course.id, 'delete')}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Security Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Logs de sécurité</CardTitle>
                <CardDescription>Activités suspectes récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm">Tentative de connexion échouée</p>
                      <p className="text-xs text-muted-foreground">IP: 192.168.1.100 - Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm">Accès administrateur autorisé</p>
                      <p className="text-xs text-muted-foreground">Admin John - Il y a 4 heures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm">Trafic anormal détecté</p>
                      <p className="text-xs text-muted-foreground">Endpoint /api/courses - Il y a 6 heures</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-muted-foreground">Obligatoire pour les enseignants</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Limitation du débit</p>
                    <p className="text-sm text-muted-foreground">Protection contre les attaques DDoS</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Logs détaillés</p>
                    <p className="text-sm text-muted-foreground">Enregistrement complet des activités</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance automatique</p>
                    <p className="text-sm text-muted-foreground">Mises à jour de sécurité automatiques</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse des revenus</CardTitle>
                <CardDescription>Évolution mensuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-semibold">15,240€</div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +18% par rapport au mois dernier
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Abonnements</span>
                      <span>12,340€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cours individuels</span>
                      <span>2,900€</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Croissance des utilisateurs</CardTitle>
                <CardDescription>Nouveaux utilisateurs ce mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-semibold">342</div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +23% par rapport au mois dernier
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Étudiants</span>
                      <span>298</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enseignants</span>
                      <span>44</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Creation Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel utilisateur à la plateforme
            </DialogDescription>
          </DialogHeader>
          <UserCreationForm onSubmit={handleCreateUser} onCancel={() => setShowUserModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>
              Envoyez une notification à vos utilisateurs
            </DialogDescription>
          </DialogHeader>
          <NotificationForm onSubmit={(data) => {
            console.log('Sending notification:', data);
            alert('Notification envoyée avec succès !');
            setShowNotificationModal(false);
          }} onCancel={() => setShowNotificationModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserCreationForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Rôle</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Étudiant</SelectItem>
            <SelectItem value="teacher">Enseignant</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Mot de passe temporaire</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Mot de passe temporaire"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Créer l'utilisateur
        </Button>
      </div>
    </form>
  );
}

function NotificationForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="title">Titre de la notification</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Type de notification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Information</SelectItem>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="success">Succès</SelectItem>
              <SelectItem value="error">Erreur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recipients">Destinataires</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, recipients: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Qui doit recevoir ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="students">Étudiants seulement</SelectItem>
              <SelectItem value="teachers">Enseignants seulement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Envoyer la notification
        </Button>
      </div>
    </form>
  );
}