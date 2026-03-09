import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from '../../lib/i18n';
import { mockCourses } from '../../lib/auth';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Play,
  TrendingUp,
  Megaphone,
  Target,
  Zap,
  BarChart3,
  Share2,
  DollarSign,
  Mail
} from 'lucide-react';

interface MarketingCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function MarketingCoursesPage({ onNavigate }: MarketingCoursesPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  // Mock marketing-specific courses
  const marketingCourses = [
    {
      id: 'marketing-1',
      title: 'Digital Marketing Fundamentals',
      description: 'Master the basics of digital marketing including SEO, SEM, social media, and analytics.',
      instructorId: '1',
      instructorName: 'Sarah Johnson',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
      duration: 220,
      studentsCount: 5280,
      category: 'Marketing',
      isLive: true,
      price: 89,
      level: 'beginner',
      rating: 4.8,
      specialty: 'Digital',
      channels: ['SEO', 'Google Ads', 'Social Media', 'Email'],
      skills: ['Strategy', 'Analytics', 'Campaign Management', 'ROI Optimization']
    },
    {
      id: 'marketing-2',
      title: 'Social Media Marketing Mastery',
      description: 'Build and grow your brand on social platforms with proven strategies and tactics.',
      instructorId: '2',
      instructorName: 'Marcus Rodriguez',
      coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600',
      duration: 180,
      studentsCount: 4120,
      category: 'Marketing',
      isLive: false,
      price: 119,
      level: 'intermediate',
      rating: 4.7,
      specialty: 'Social Media',
      channels: ['Instagram', 'TikTok', 'LinkedIn', 'Facebook'],
      skills: ['Content Strategy', 'Community Management', 'Influencer Marketing', 'Paid Social']
    },
    {
      id: 'marketing-3',
      title: 'Google Ads & PPC Advertising',
      description: 'Master Google Ads and pay-per-click advertising to drive targeted traffic and conversions.',
      instructorId: '3',
      instructorName: 'Jennifer Chen',
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600',
      duration: 160,
      studentsCount: 3450,
      category: 'Marketing',
      isLive: true,
      price: 149,
      level: 'intermediate',
      rating: 4.9,
      specialty: 'PPC',
      channels: ['Google Ads', 'Bing Ads', 'YouTube Ads'],
      skills: ['Campaign Setup', 'Keyword Research', 'Bid Management', 'Conversion Tracking']
    },
    {
      id: 'marketing-4',
      title: 'Content Marketing Strategy',
      description: 'Create compelling content that engages audiences and drives business results.',
      instructorId: '4',
      instructorName: 'David Wilson',
      coverImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=600',
      duration: 200,
      studentsCount: 2890,
      category: 'Marketing',
      isLive: false,
      price: 99,
      level: 'beginner',
      rating: 4.6,
      specialty: 'Content',
      channels: ['Blog', 'Video', 'Podcast', 'Newsletter'],
      skills: ['Content Planning', 'Storytelling', 'SEO Writing', 'Video Marketing']
    },
    {
      id: 'marketing-5',
      title: 'Email Marketing Automation',
      description: 'Build automated email campaigns that nurture leads and increase customer lifetime value.',
      instructorId: '5',
      instructorName: 'Lisa Thompson',
      coverImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=600',
      duration: 140,
      studentsCount: 2340,
      category: 'Marketing',
      isLive: true,
      price: 79,
      level: 'intermediate',
      rating: 4.5,
      specialty: 'Email',
      channels: ['Mailchimp', 'HubSpot', 'ConvertKit'],
      skills: ['Automation', 'Segmentation', 'A/B Testing', 'Deliverability']
    },
    {
      id: 'marketing-6',
      title: 'Marketing Analytics & Data Science',
      description: 'Use data and analytics to make informed marketing decisions and optimize campaigns.',
      instructorId: '6',
      instructorName: 'Michael Park',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600',
      duration: 190,
      studentsCount: 1980,
      category: 'Marketing',
      isLive: false,
      price: 159,
      level: 'advanced',
      rating: 4.8,
      specialty: 'Analytics',
      channels: ['Google Analytics', 'Data Studio', 'Tableau'],
      skills: ['Data Analysis', 'Attribution Modeling', 'Predictive Analytics', 'Dashboard Creation']
    }
  ];

  const allCourses = [...mockCourses.filter(c => c.category === 'Marketing'), ...marketingCourses];

  useEffect(() => {
    let filtered = allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && course.price === 0) ||
                          (priceFilter === 'paid' && course.price > 0) ||
                          (priceFilter === 'under50' && course.price < 50) ||
                          (priceFilter === 'under100' && course.price < 100);

      return matchesSearch && matchesLevel && matchesPrice;
    });

    // Sort courses
    if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.studentsCount - a.studentsCount);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredCourses(filtered);
  }, [searchTerm, sortBy, levelFilter, priceFilter]);

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'digital': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'social media': return <Share2 className="w-5 h-5 text-pink-500" />;
      case 'ppc': return <Target className="w-5 h-5 text-green-500" />;
      case 'content': return <Megaphone className="w-5 h-5 text-purple-500" />;
      case 'email': return <Mail className="w-5 h-5 text-orange-500" />;
      case 'analytics': return <BarChart3 className="w-5 h-5 text-cyan-500" />;
      default: return <DollarSign className="w-5 h-5 text-emerald-500" />;
    }
  };

  const marketingSpecialties = [
    { name: 'Digital Marketing', icon: <TrendingUp className="w-4 h-4" />, courses: 15 },
    { name: 'Social Media', icon: <Share2 className="w-4 h-4" />, courses: 12 },
    { name: 'PPC & Ads', icon: <Target className="w-4 h-4" />, courses: 8 },
    { name: 'Content Marketing', icon: <Megaphone className="w-4 h-4" />, courses: 10 },
    { name: 'Email Marketing', icon: <Mail className="w-4 h-4" />, courses: 6 },
    { name: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, courses: 7 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <span className="text-green-600 font-medium">Marketing</span>
            </div>
            <h1 className="text-4xl mb-6">
              Développez Votre Impact Marketing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Maîtrisez les stratégies marketing modernes pour faire croître votre business. 
              Du marketing digital aux analytics, apprenez les techniques qui fonctionnent.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">40+</div>
                <div className="text-sm text-muted-foreground">Cours marketing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">18K+</div>
                <div className="text-sm text-muted-foreground">Marketeurs formés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">25+</div>
                <div className="text-sm text-muted-foreground">Spécialisations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-lime-600">97%</div>
                <div className="text-sm text-muted-foreground">ROI positif</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Marketing Specialties */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6">Spécialisations Marketing</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {marketingSpecialties.map((specialty) => (
              <Card key={specialty.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2 text-green-600">
                    {specialty.icon}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{specialty.name}</h3>
                  <p className="text-xs text-muted-foreground">{specialty.courses} cours</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par cours, instructeur ou spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularité</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="newest">Plus récents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous prix</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="under50">Moins de 50€</SelectItem>
                  <SelectItem value="under100">Moins de 100€</SelectItem>
                  <SelectItem value="paid">Payant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">
              {filteredCourses.length} cours trouvés
            </h2>
            <Badge variant="outline" className="text-sm">
              Marketing
            </Badge>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-all cursor-pointer group">
              <div className="relative">
                <ImageWithFallback
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={course.isLive ? "destructive" : "secondary"} className="text-xs">
                    {course.isLive ? 'Live' : 'À la demande'}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  {course.specialty && getSpecialtyIcon(course.specialty)}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" className="pointer-events-none">
                    <Play className="w-4 h-4 mr-2" />
                    Voir le cours
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.level === 'beginner' ? 'Débutant' : 
                     course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </Badge>
                  <div className="text-right">
                    <div className="text-xl font-bold">{course.price === 0 ? 'Gratuit' : `${course.price}€`}</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">{course.instructorName}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{course.rating || 4.5}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course.studentsCount?.toLocaleString() || course.studentCount?.toLocaleString()} étudiants</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                  </div>
                </div>

                {course.channels && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.channels.slice(0, 3).map((channel: string) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                    {course.channels.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.channels.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => onNavigate(`/courses/${course.id}`)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Voir le cours
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              Aucun cours trouvé pour ces critères
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setLevelFilter('all');
                setPriceFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-8">
          <h2 className="text-2xl mb-4">Partagez votre expertise marketing</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Aidez d'autres entrepreneurs et marketeurs à développer leurs compétences en partageant vos stratégies gagnantes.
          </p>
          <Button size="lg" onClick={() => onNavigate('/teacher/signup')}>
            <Zap className="w-5 h-5 mr-2" />
            Devenir instructeur marketing
          </Button>
        </div>
      </div>
    </div>
  );
}