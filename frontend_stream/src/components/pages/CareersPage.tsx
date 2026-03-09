import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useTranslation } from '../../lib/i18n';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  Zap,
  Target,
  Globe,
  Coffee,
  Laptop,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';

interface CareersPageProps {
  onNavigate: (path: string) => void;
}

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  featured: boolean;
}

export function CareersPage({ onNavigate }: CareersPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const departments = [
    { id: 'all', name: 'Tous les départements', count: 12 },
    { id: 'engineering', name: 'Ingénierie', count: 5 },
    { id: 'product', name: 'Produit', count: 3 },
    { id: 'design', name: 'Design', count: 2 },
    { id: 'marketing', name: 'Marketing', count: 2 }
  ];

  const locations = [
    { id: 'all', name: 'Tous les lieux' },
    { id: 'paris', name: 'Paris' },
    { id: 'lyon', name: 'Lyon' },
    { id: 'remote', name: 'Télétravail' }
  ];

  const jobPositions: JobPosition[] = [
    {
      id: '1',
      title: 'Développeur Full Stack Senior',
      department: 'engineering',
      location: 'Paris / Remote',
      type: 'CDI',
      experience: '5+ ans',
      salary: '60k - 80k €',
      description: 'Rejoignez notre équipe technique pour développer la prochaine génération de notre plateforme d\'apprentissage.',
      requirements: [
        'Maîtrise de React, Node.js et TypeScript',
        'Expérience avec les bases de données (PostgreSQL, MongoDB)',
        'Connaissance des architectures cloud (AWS, Azure)',
        'Méthodes Agile/Scrum'
      ],
      benefits: [
        'Télétravail flexible',
        'Formation continue',
        'Équipement fourni',
        'Assurance santé premium'
      ],
      featured: true
    },
    {
      id: '2',
      title: 'Designer UX/UI',
      department: 'design',
      location: 'Paris',
      type: 'CDI',
      experience: '3-5 ans',
      salary: '45k - 60k €',
      description: 'Créez des expériences utilisateur exceptionnelles pour nos millions d\'apprenants.',
      requirements: [
        'Portfolio démontrant des compétences en UX/UI',
        'Maîtrise de Figma, Sketch, Adobe Creative Suite',
        'Expérience en design thinking et recherche utilisateur',
        'Connaissance des principes d\'accessibilité'
      ],
      benefits: [
        'Horaires flexibles',
        'Budget formation',
        'Espaces créatifs',
        'Team building réguliers'
      ],
      featured: false
    },
    {
      id: '3',
      title: 'Product Manager',
      department: 'product',
      location: 'Paris / Lyon',
      type: 'CDI',
      experience: '4+ ans',
      salary: '55k - 75k €',
      description: 'Pilotez le développement produit et définissez la stratégie de nos fonctionnalités.',
      requirements: [
        'Expérience en product management dans la tech',
        'Compétences analytiques et data-driven',
        'Excellente communication et leadership',
        'Connaissance des méthodes agiles'
      ],
      benefits: [
        'Participation aux bénéfices',
        'Conférences internationales',
        'Mentorat personnalisé',
        'Congés sabbatiques'
      ],
      featured: true
    },
    {
      id: '4',
      title: 'Ingénieur DevOps',
      department: 'engineering',
      location: 'Remote',
      type: 'CDI',
      experience: '3-6 ans',
      salary: '55k - 70k €',
      description: 'Assurez la scalabilité et la fiabilité de notre infrastructure.',
      requirements: [
        'Expertise Docker, Kubernetes, CI/CD',
        'Expérience cloud AWS/Azure/GCP',
        'Monitoring et observabilité',
        'Sécurité des systèmes'
      ],
      benefits: [
        '100% télétravail',
        'Matériel haut de gamme',
        'Formations certifiantes',
        'Stock options'
      ],
      featured: false
    },
    {
      id: '5',
      title: 'Stage - Développeur Frontend',
      department: 'engineering',
      location: 'Paris',
      type: 'Stage',
      experience: 'Étudiant',
      salary: '1200 € / mois',
      description: 'Découvrez le développement web moderne dans une équipe dynamique.',
      requirements: [
        'Formation en informatique (Bac+3/4)',
        'Connaissances en JavaScript, React',
        'Passion pour le frontend',
        'Anglais courant'
      ],
      benefits: [
        'Mentorat dédié',
        'Projets concrets',
        'Environnement startup',
        'Possibilité d\'embauche'
      ],
      featured: false
    }
  ];

  const companyValues = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion',
      description: 'Nous croyons en l\'impact transformateur de l\'éducation'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Collaboration',
      description: 'L\'intelligence collective nous rend plus forts'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Nous visons toujours la qualité dans nos réalisations'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Nous repoussons les limites de l\'apprentissage en ligne'
    }
  ];

  const filteredJobs = jobPositions.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesLocation = selectedLocation === 'all' || 
                           job.location.toLowerCase().includes(selectedLocation);
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const featuredJobs = filteredJobs.filter(job => job.featured);
  const regularJobs = filteredJobs.filter(job => !job.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rejoignez l'équipe Stream Éducatif
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Construisez l'avenir de l'éducation avec nous. Nous recherchons des talents 
              passionnés pour révolutionner l'apprentissage en ligne.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-green-200">Collaborateurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">15</div>
                <div className="text-green-200">Nationalités</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-green-200">Glassdoor</div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Voir nos offres
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Valeurs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ces valeurs guident nos décisions quotidiennes et définissent notre culture d'entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="text-primary mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi nous rejoindre ?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Laptop className="w-6 h-6" />,
                title: 'Télétravail Flexible',
                description: 'Travaillez d\'où vous voulez, quand vous voulez'
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Évolution Rapide',
                description: 'Opportunités de progression dans une startup en croissance'
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Formation Continue',
                description: 'Budget formation et accès illimité à nos cours'
              },
              {
                icon: <Coffee className="w-6 h-6" />,
                title: 'Environnement Startup',
                description: 'Café illimité, baby-foot et ambiance détendue'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Impact Global',
                description: 'Votre travail impacte des millions d\'apprenants'
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Équilibre Vie Pro/Perso',
                description: 'Congés illimités et horaires flexibles'
              }
            ].map((benefit, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-lg">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="jobs" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Offres d'Emploi</h2>
            <p className="text-xl text-muted-foreground">
              Trouvez le poste qui correspond à vos ambitions
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12">
            <div className="grid lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Rechercher un poste..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.count})
                  </option>
                ))}
              </select>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Jobs */}
          {featuredJobs.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                Postes Prioritaires
              </h3>
              <div className="grid lg:grid-cols-2 gap-6">
                {featuredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow border-primary/20">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </span>
                            <Badge variant={job.type === 'CDI' ? 'default' : 'secondary'}>
                              {job.type}
                            </Badge>
                          </CardDescription>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Prioritaire
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium">Expérience:</span> {job.experience}
                        </div>
                        <div>
                          <span className="font-medium">Salaire:</span> {job.salary}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Département: {departments.find(d => d.id === job.department)?.name}
                        </div>
                        <Button>
                          Postuler
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Jobs */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">
              Toutes les offres ({filteredJobs.length})
            </h3>
            
            {regularJobs.length > 0 ? (
              <div className="space-y-6">
                {regularJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2">
                          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                          <p className="text-muted-foreground mb-2">{job.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {job.experience}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Badge variant={job.type === 'CDI' ? 'default' : 'secondary'}>
                            {job.type}
                          </Badge>
                          <div className="text-sm">
                            <div className="font-medium">{job.salary}</div>
                            <div className="text-muted-foreground">
                              {departments.find(d => d.id === job.department)?.name}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button variant="outline">
                            Voir le poste
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun poste trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('all');
                      setSelectedLocation('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vous ne trouvez pas le poste idéal ?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Envoyez-nous votre candidature spontanée. Nous serions ravis d'échanger 
            avec vous sur les opportunités futures.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => onNavigate('/contact')}
            >
              Candidature spontanée
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => onNavigate('/contact')}
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}