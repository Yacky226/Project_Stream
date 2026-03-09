import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { EmptyState } from '../layout/EmptyState';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award, 
  Upload,
  Edit,
  Save,
  Shield,
  Lock,
  Star,
  TrendingUp,
  GraduationCap,
  X
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  birthDate?: string;
  avatar: string;
  role: 'student' | 'teacher' | 'admin';
  joinDate: string;
  level?: string;
  specialty?: string;
  completedCourses?: number;
  totalStudents?: number;
  averageRating?: number;
  certifications?: Certification[];
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  verified: boolean;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('profile');

  useEffect(() => {
    if (!isLoading && !user) {
      onNavigate('/auth/signin');
    }
  }, [user, isLoading, onNavigate]);

  // Mock data - À remplacer par des appels API
  const getUserProfile = (): UserProfile => {
    const baseProfile = {
      id: user?.id || '1',
      name: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur Test',
      email: user?.email || 'user@example.com',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      birthDate: '1990-05-15',
      avatar: '',
      role: (user?.role || 'student') as 'student' | 'teacher' | 'admin',
      joinDate: '2023-09-15',
      certifications: [
        {
          id: '1',
          title: 'React Developer Certification',
          issuer: 'Meta',
          date: '2023-08-15',
          verified: true
        },
        {
          id: '2',
          title: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-03-20',
          verified: true
        }
      ]
    };

    if (user?.role === 'teacher') {
      return {
        ...baseProfile,
        bio: 'Développeur full-stack passionné par l\'enseignement et les nouvelles technologies. Spécialisé en React, Node.js et TypeScript.',
        specialty: 'Développement Frontend',
        totalStudents: 245,
        averageRating: 4.8,
      };
    } else if (user?.role === 'admin') {
      return {
        ...baseProfile,
        bio: 'Administrateur de la plateforme Stream Éducatif, responsable de la gestion des utilisateurs et du contenu.',
        specialty: 'Administration Système',
        totalStudents: 0,
        averageRating: 0,
      };
    } else {
      return {
        ...baseProfile,
        bio: 'Étudiant passionné par l\'apprentissage en ligne et le développement de nouvelles compétences.',
        level: 'Intermédiaire',
        completedCourses: 12,
      };
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <EmptyState
          icon={GraduationCap}
          title="Accès restreint"
          description="Vous devez être connecté pour accéder à votre profil"
          action={{
            label: 'Se connecter',
            onClick: () => onNavigate('/auth/signin')
          }}
        />
      </PageContainer>
    );
  }

  const userProfile = getUserProfile();

  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone || '',
    bio: userProfile.bio || '',
    location: userProfile.location || '',
    specialty: userProfile.specialty || '',
    level: userProfile.level || ''
  });

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // TODO: Implémenter la sauvegarde
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      specialty: userProfile.specialty || '',
      level: userProfile.level || ''
    });
    setIsEditing(false);
  };

  const stats = userProfile.role === 'teacher' ? [
    { label: 'Étudiants', value: userProfile.totalStudents, icon: User },
    { label: 'Note moyenne', value: `${userProfile.averageRating}/5`, icon: Star },
    { label: 'Cours créés', value: 3, icon: BookOpen },
    { label: 'Certifications', value: userProfile.certifications?.length || 0, icon: Award }
  ] : [
    { label: 'Cours suivis', value: userProfile.completedCourses || 12, icon: BookOpen },
    { label: 'Niveau', value: userProfile.level || 'Intermédiaire', icon: TrendingUp },
    { label: 'Certifications', value: userProfile.certifications?.length || 0, icon: Award },
    { label: 'Membre depuis', value: new Date(userProfile.joinDate).getFullYear(), icon: Calendar }
  ];

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Mon Profil"
        description="Gérez vos informations personnelles et vos préférences"
        onBack={() => onNavigate(-1)}
      />

      {/* Profile Header */}
      <Card className="mb-6 lg:mb-8">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mb-4">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-xl sm:text-2xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Changer la photo
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-semibold">{userProfile.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={userProfile.role === 'teacher' ? 'default' : 'secondary'}>
                      {userProfile.role === 'teacher' ? 'Enseignant' : 
                       userProfile.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                    </Badge>
                    {userProfile.specialty && (
                      <Badge variant="outline">{userProfile.specialty}</Badge>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">{userProfile.email}</p>
                </div>
                
                {/* Edit/Save Buttons */}
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="flex-1 sm:flex-none">
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <stat.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="text-lg sm:text-xl font-semibold">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">Profil</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">Sécurité</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-sm">Préférences</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm">Réalisations</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Gérez vos informations de profil et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {userProfile.role === 'teacher' && (
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Spécialité</Label>
                      <Select 
                        value={formData.specialty} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Développement Frontend">Développement Frontend</SelectItem>
                          <SelectItem value="Développement Backend">Développement Backend</SelectItem>
                          <SelectItem value="Full Stack">Full Stack</SelectItem>
                          <SelectItem value="Mobile">Développement Mobile</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {userProfile.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="level">Niveau</Label>
                      <Select 
                        value={formData.level} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner votre niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Débutant">Débutant</SelectItem>
                          <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                          <SelectItem value="Avancé">Avancé</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={6}
                      placeholder="Parlez-nous de vous..."
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{userProfile.email}</p>
                    <p className="text-sm text-muted-foreground">Email principal</p>
                  </div>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{userProfile.phone}</p>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                    </div>
                  </div>
                )}
                {userProfile.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{userProfile.location}</p>
                      <p className="text-sm text-muted-foreground">Localisation</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      Membre depuis {new Date(userProfile.joinDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">Date d'inscription</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez vos paramètres de sécurité et authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password */}
              <div className="space-y-4">
                <h4 className="font-medium">Mot de passe</h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">Mot de passe</p>
                      <p className="text-sm text-muted-foreground">Dernière modification il y a 3 mois</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Changer
                  </Button>
                </div>
              </div>

              {/* 2FA */}
              <div className="space-y-4">
                <h4 className="font-medium">Authentification à deux facteurs</h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">2FA activée</p>
                      <p className="text-sm text-muted-foreground">Application d'authentification configurée</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Gérer 2FA
                  </Button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="space-y-4">
                <h4 className="font-medium">Sessions actives</h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium">Session actuelle</p>
                      <p className="text-sm text-muted-foreground">Chrome sur Windows - Paris, France</p>
                    </div>
                    <Badge variant="outline" className="w-fit">Actuelle</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium">Session mobile</p>
                      <p className="text-sm text-muted-foreground">Safari sur iPhone - Il y a 2 heures</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Déconnecter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>
                Personnalisez votre expérience sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium">Notifications</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Nouveaux cours', description: 'Recevoir une notification pour les nouveaux cours', checked: true },
                    { label: 'Sessions live', description: 'Notifications pour les sessions en direct', checked: true },
                    { label: 'Newsletter', description: 'Recevoir notre newsletter hebdomadaire', checked: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{item.label}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.checked} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Language and Region */}
              <div className="space-y-4">
                <h4 className="font-medium">Langue et région</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select defaultValue="fr">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select defaultValue="europe/paris">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="europe/paris">Europe/Paris</SelectItem>
                        <SelectItem value="america/new_york">America/New_York</SelectItem>
                        <SelectItem value="asia/tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="space-y-4">
                <h4 className="font-medium">Confidentialité</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Profil public', description: 'Permettre aux autres de voir votre profil', checked: true },
                    { label: 'Progrès visible', description: 'Afficher vos progrès aux autres étudiants', checked: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{item.label}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.checked} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Vos certifications et accomplissements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userProfile.certifications?.map(cert => (
                  <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className={`w-6 h-6 flex-shrink-0 ${cert.verified ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{cert.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuer} • {new Date(cert.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {cert.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                        <Shield className="w-3 h-3 mr-1" />
                        Vérifiée
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {userProfile.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle>Progression des cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'React Hooks Avancés', progress: 85 },
                    { name: 'TypeScript Masterclass', progress: 60 },
                    { name: 'Vue.js Fondamentaux', progress: 100, completed: true }
                  ].map((course, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm sm:text-base">{course.name}</span>
                        <span className={`text-sm ${course.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {course.completed ? 'Terminé' : `${course.progress}%`}
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
