import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../lib/i18n';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  Award,
  TrendingUp,
  Mail,
  Phone
} from 'lucide-react';

interface BusinessPageProps {
  onNavigate: (path: string) => void;
}

export function BusinessPage({ onNavigate }: BusinessPageProps) {
  const { t } = useTranslation();
  const [contactForm, setContactForm] = useState({
    company: '',
    email: '',
    employees: '',
    message: ''
  });

  const features = [
    {
      icon: Users,
      title: 'Gestion d\'équipe avancée',
      description: 'Inscrivez et gérez facilement vos employés avec un tableau de bord administrateur complet'
    },
    {
      icon: BarChart3,
      title: 'Analytiques détaillées',
      description: 'Suivez les progrès de vos équipes avec des rapports détaillés et des métriques personnalisées'
    },
    {
      icon: Shield,
      title: 'Sécurité entreprise',
      description: 'SSO, authentification multi-facteurs et conformité aux standards de sécurité'
    },
    {
      icon: Target,
      title: 'Parcours personnalisés',
      description: 'Créez des programmes de formation adaptés aux besoins spécifiques de votre entreprise'
    },
    {
      icon: Award,
      title: 'Certifications reconnues',
      description: 'Délivrez des certifications officielles validées par des experts métier'
    },
    {
      icon: Clock,
      title: 'Support prioritaire',
      description: 'Assistance dédiée 24/7 avec un gestionnaire de compte attitré'
    }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '49€',
      period: '/mois',
      description: 'Pour les petites équipes',
      features: [
        'Jusqu\'à 25 utilisateurs',
        'Accès à tous les cours',
        'Rapports basiques',
        'Support email'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '149€',
      period: '/mois',
      description: 'Pour les entreprises en croissance',
      features: [
        'Jusqu\'à 100 utilisateurs',
        'Analytiques avancées',
        'Parcours personnalisés',
        'Support prioritaire',
        'SSO inclus'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: '',
      description: 'Pour les grandes organisations',
      features: [
        'Utilisateurs illimités',
        'Intégrations personnalisées',
        'Gestionnaire de compte dédié',
        'Formation sur site',
        'Conformité avancée'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      company: 'TechCorp',
      logo: '🏢',
      quote: 'Stream Éducatif a transformé notre façon de former nos équipes. La plateforme est intuitive et les résultats sont mesurables.',
      author: 'Marie Dubois',
      role: 'DRH'
    },
    {
      company: 'InnovateLab',
      logo: '🚀',
      quote: 'Excellent ROI sur notre investissement formation. Nos développeurs montent en compétences rapidement.',
      author: 'Pierre Martin',
      role: 'CTO'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Demande envoyée ! Notre équipe vous contactera sous 24h.');
    setContactForm({ company: '', email: '', employees: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              Pour les entreprises
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Formez vos équipes avec 
              <span className="block text-yellow-300">Stream Éducatif Business</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Développez les compétences de vos collaborateurs avec notre plateforme 
              d'apprentissage conçue pour les entreprises modernes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                Demander une démo
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/20 hover:border-white/70 px-8 py-4 font-semibold shadow-lg">
                Essai gratuit 14 jours
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-muted-foreground">Entreprises clientes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-muted-foreground">Employés formés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-muted-foreground">Taux de satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8/5</div>
              <div className="text-muted-foreground">Note moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Pourquoi choisir Stream Éducatif Business ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une plateforme complète avec tous les outils nécessaires pour former 
              efficacement vos équipes et mesurer l'impact de vos programmes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Des tarifs adaptés à votre taille</h2>
            <p className="text-xl text-muted-foreground">
              Choisissez le plan qui correspond à vos besoins et évoluez à votre rythme
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Plus populaire
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Enterprise' ? 'Nous contacter' : 'Commencer'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Ils nous font confiance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{testimonial.logo}</div>
                    <div>
                      <div className="font-semibold">{testimonial.company}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.author} - {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Prêt à transformer votre formation ?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Contactez notre équipe pour une démonstration personnalisée 
                et découvrez comment Stream Éducatif peut révolutionner 
                la formation dans votre entreprise.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>business@stream-educatif.fr</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>+33 1 23 45 67 89</span>
                </div>
              </div>
            </div>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Demander une démo</CardTitle>
                <CardDescription className="text-blue-100">
                  Nous vous recontactons sous 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    placeholder="Nom de l'entreprise"
                    value={contactForm.company}
                    onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email professionnel"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    required
                  />
                  <select 
                    value={contactForm.employees}
                    onChange={(e) => setContactForm(prev => ({ ...prev, employees: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                    required
                  >
                    <option value="" className="text-black">Taille de l'entreprise</option>
                    <option value="1-25" className="text-black">1-25 employés</option>
                    <option value="26-100" className="text-black">26-100 employés</option>
                    <option value="101-500" className="text-black">101-500 employés</option>
                    <option value="500+" className="text-black">500+ employés</option>
                  </select>
                  <Button type="submit" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Demander une démo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}