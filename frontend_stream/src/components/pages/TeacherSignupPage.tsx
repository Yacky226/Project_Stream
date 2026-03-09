import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../lib/i18n';
import { 
  Users, 
  DollarSign, 
  Clock, 
  Globe,
  Award,
  BookOpen,
  Video,
  BarChart3,
  CheckCircle,
  Star,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Upload
} from 'lucide-react';

interface TeacherSignupPageProps {
  onNavigate: (path: string) => void;
}

export function TeacherSignupPage({ onNavigate }: TeacherSignupPageProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Professional Info
    expertise: '',
    experience: '',
    education: '',
    bio: '',
    
    // Teaching Info
    motivation: '',
    courseIdeas: '',
    teachingStyle: ''
  });

  const benefits = [
    {
      icon: DollarSign,
      title: 'Revenus attractifs',
      description: 'Gagnez jusqu\'à 5000€ par mois en enseignant vos compétences',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: 'Flexibilité totale',
      description: 'Enseignez quand vous voulez, où vous voulez',
      color: 'text-blue-600'
    },
    {
      icon: Globe,
      title: 'Audience mondiale',
      description: 'Touchez des milliers d\'étudiants dans le monde entier',
      color: 'text-purple-600'
    },
    {
      icon: Award,
      title: 'Reconnaissance',
      description: 'Devenez un expert reconnu dans votre domaine',
      color: 'text-orange-600'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Enseignants actifs' },
    { value: '500K+', label: 'Étudiants formés' },
    { value: '4.8/5', label: 'Note moyenne' },
    { value: '95%', label: 'Taux de satisfaction' }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Développeuse Frontend',
      avatar: '👩‍💻',
      quote: 'Enseigner sur Stream Éducatif m\'a permis de partager ma passion et de générer un revenu complémentaire significatif.',
      earnings: '3,200€/mois'
    },
    {
      name: 'Pierre Martin',
      role: 'Designer UX',
      avatar: '👨‍🎨',
      quote: 'Une plateforme exceptionnelle avec des outils de qualité professionnelle. Mes cours ont déjà touché plus de 2000 étudiants.',
      earnings: '2,800€/mois'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      alert('Candidature envoyée ! Notre équipe vous contactera sous 48h.');
      onNavigate('/');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Devenez enseignant sur
              <span className="block text-yellow-300">Stream Éducatif</span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Partagez vos connaissances avec des milliers d'étudiants passionnés 
              et créez une source de revenus durable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4"
                onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Users className="w-5 h-5 mr-2" />
                Commencer maintenant
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/50 text-white hover:bg-white/20 hover:border-white/70 px-8 py-4 font-semibold shadow-lg"
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              >
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Pourquoi enseigner avec nous ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Rejoignez une communauté d'enseignants passionnés et bénéficiez d'outils 
              de pointe pour créer des expériences d'apprentissage exceptionnelles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Des outils professionnels</h2>
            <p className="text-xl text-muted-foreground">
              Tout ce dont vous avez besoin pour créer et diffuser vos cours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <Video className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Studio de création</h3>
                <p className="text-muted-foreground mb-4">
                  Interface intuitive pour enregistrer, éditer et publier vos cours vidéo
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Enregistrement HD jusqu'à 4K</li>
                  <li>• Édition vidéo intégrée</li>
                  <li>• Sous-titres automatiques</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Analytiques détaillées</h3>
                <p className="text-muted-foreground mb-4">
                  Suivez les performances de vos cours et l'engagement de vos étudiants
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Statistiques de visionnage</li>
                  <li>• Taux de completion</li>
                  <li>• Feedback étudiant</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Sessions live</h3>
                <p className="text-muted-foreground mb-4">
                  Interagissez directement avec vos étudiants lors de sessions en temps réel
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Streaming HD stable</li>
                  <li>• Chat interactif</li>
                  <li>• Enregistrement automatique</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Témoignages d'enseignants
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <Badge className="bg-green-100 text-green-700 mt-1">
                        {testimonial.earnings}
                      </Badge>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center mt-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Postulez maintenant</h2>
              <p className="text-muted-foreground">
                Étape {step} sur 3 - Parlez-nous de vous et de votre expertise
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Prénom *</label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom *</label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Téléphone</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold mb-4">Expérience professionnelle</h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Domaine d'expertise *</label>
                        <Input
                          value={formData.expertise}
                          onChange={(e) => setFormData(prev => ({ ...prev, expertise: e.target.value }))}
                          placeholder="Ex: Développement web, Design UX, Marketing digital..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Années d'expérience *</label>
                        <select 
                          value={formData.experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md"
                          required
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="1-2">1-2 ans</option>
                          <option value="3-5">3-5 ans</option>
                          <option value="6-10">6-10 ans</option>
                          <option value="10+">Plus de 10 ans</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Formation *</label>
                        <Textarea
                          value={formData.education}
                          onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                          placeholder="Décrivez votre parcours éducatif et vos certifications..."
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Bio professionnelle *</label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Présentez-vous en quelques lignes..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold mb-4">Motivation et projets</h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Pourquoi voulez-vous enseigner ? *</label>
                        <Textarea
                          value={formData.motivation}
                          onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                          placeholder="Partagez votre motivation pour l'enseignement..."
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Idées de cours *</label>
                        <Textarea
                          value={formData.courseIdeas}
                          onChange={(e) => setFormData(prev => ({ ...prev, courseIdeas: e.target.value }))}
                          placeholder="Quels cours aimeriez-vous créer ?"
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Style d'enseignement</label>
                        <Textarea
                          value={formData.teachingStyle}
                          onChange={(e) => setFormData(prev => ({ ...prev, teachingStyle: e.target.value }))}
                          placeholder="Décrivez votre approche pédagogique..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    {step > 1 && (
                      <Button type="button" variant="outline" onClick={handleBack}>
                        Précédent
                      </Button>
                    )}
                    <Button type="submit" className="ml-auto">
                      {step < 3 ? 'Suivant' : 'Envoyer ma candidature'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}