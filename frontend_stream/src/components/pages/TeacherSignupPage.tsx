import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterTeacherData } from '../../types/auth';
import {
  Users,
  DollarSign,
  Clock,
  Globe,
  Award,
  Video,
  BarChart3,
  MessageSquare,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface TeacherSignupPageProps {
  onNavigate: (path: string) => void;
}

type TeacherSignupStep = 1 | 2 | 3;

interface TeacherSignupFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateNaissance: string;
  phone: string;
  expertise: string;
  experience: string;
  education: string;
  bio: string;
  motivation: string;
  courseIdeas: string;
  teachingStyle: string;
}

const initialForm: TeacherSignupFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateNaissance: '',
  phone: '',
  expertise: '',
  experience: '',
  education: '',
  bio: '',
  motivation: '',
  courseIdeas: '',
  teachingStyle: '',
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStep(
  step: TeacherSignupStep,
  formData: TeacherSignupFormState,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prenom est requis.';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis.';
    }
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis.';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'Format d\'email invalide.';
    }
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caracteres.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
  }

  if (step === 2) {
    if (!formData.expertise.trim()) {
      errors.expertise = 'Le domaine d\'expertise est requis.';
    }
    if (!formData.experience.trim()) {
      errors.experience = 'Le niveau d\'experience est requis.';
    }
    if (!formData.education.trim()) {
      errors.education = 'La formation est requise.';
    }
    if (!formData.bio.trim()) {
      errors.bio = 'La bio professionnelle est requise.';
    }
  }

  if (step === 3) {
    if (!formData.motivation.trim()) {
      errors.motivation = 'La motivation est requise.';
    }
    if (!formData.courseIdeas.trim()) {
      errors.courseIdeas = 'Les idees de cours sont requises.';
    }
  }

  return errors;
}

export function TeacherSignupPage({ onNavigate }: TeacherSignupPageProps) {
  const { registerTeacher, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState<TeacherSignupStep>(1);
  const [formData, setFormData] = useState<TeacherSignupFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    clearError();
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [clearError]);

  const benefits = [
    {
      icon: DollarSign,
      title: 'Revenus attractifs',
      description: 'Monetisez votre expertise avec des formations premium.',
      color: 'text-green-600',
    },
    {
      icon: Clock,
      title: 'Flexibilite totale',
      description: 'Creez vos sessions selon votre planning.',
      color: 'text-blue-600',
    },
    {
      icon: Globe,
      title: 'Audience large',
      description: 'Touchez des apprenants de differents niveaux.',
      color: 'text-purple-600',
    },
    {
      icon: Award,
      title: 'Impact concret',
      description: 'Contribuez a la progression de votre communaute.',
      color: 'text-orange-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Enseignants actifs' },
    { value: '500K+', label: 'Etudiants formes' },
    { value: '4.8/5', label: 'Note moyenne' },
    { value: '95%', label: 'Satisfaction' },
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Developpeuse Frontend',
      avatar: 'M',
      quote:
        'La plateforme me permet de transformer mon experience en parcours utiles et rentables.',
      earnings: '3,200 EUR/mois',
    },
    {
      name: 'Pierre Martin',
      role: 'Designer UX',
      avatar: 'P',
      quote:
        'Les outils live et replay sont stables, ce qui facilite la creation de contenu de qualite.',
      earnings: '2,800 EUR/mois',
    },
  ];

  const setField = (field: keyof TeacherSignupFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBack = () => {
    clearError();
    setSuccessMessage(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as TeacherSignupStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    const errors = validateStep(step, formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (step < 3) {
      setStep((prev) => (prev + 1) as TeacherSignupStep);
      return;
    }

    const payload: RegisterTeacherData = {
      prenom: formData.firstName.trim(),
      nom: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: 'ENSEIGNANT',
      specialite: formData.expertise.trim(),
      dateNaissance: formData.dateNaissance || undefined,
    };

    try {
      await registerTeacher(payload);
      setSuccessMessage(
        'Inscription enseignant terminee. Vous pouvez maintenant vous connecter.',
      );
      redirectTimerRef.current = window.setTimeout(() => {
        onNavigate('/auth/signin');
      }, 1500);
    } catch {
      // Error state is managed by useAuth/auth slice.
    }
  };

  const submitLabel = step < 3 ? 'Suivant' : 'Creer mon compte enseignant';

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Devenez enseignant sur
              <span className="block text-yellow-300">Stream Educatif</span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Partagez vos connaissances avec une communaute active et creez une
              source de revenus durable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4"
                onClick={() =>
                  document
                    .getElementById('application-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <Users className="w-5 h-5 mr-2" />
                Commencer maintenant
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center hover:shadow-lg transition-shadow">
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

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <Video className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Studio de creation</h3>
                <p className="text-muted-foreground">
                  Creez des cours video et des sessions live avec des outils simples.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Analytiques detaillees</h3>
                <p className="text-muted-foreground">
                  Suivez l\'engagement et les performances de vos contenus.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Interaction en direct</h3>
                <p className="text-muted-foreground">
                  Repondez aux questions et accompagnez vos etudiants en temps reel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                      {testimonial.avatar}
                    </div>
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
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star key={value} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="application-form" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Inscription enseignant</h2>
              <p className="text-muted-foreground">
                Etape {step} sur 3 - Configurez votre profil enseignant.
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                {error && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="mb-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 && (
                    <>
                      <h3 className="text-xl font-semibold">Informations personnelles</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Prenom *</label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => setField('firstName', e.target.value)}
                            disabled={isLoading}
                          />
                          {fieldErrors.firstName && (
                            <p className="text-sm text-destructive mt-1">{fieldErrors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nom *</label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => setField('lastName', e.target.value)}
                            disabled={isLoading}
                          />
                          {fieldErrors.lastName && (
                            <p className="text-sm text-destructive mt-1">{fieldErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                          disabled={isLoading}
                        />
                        {fieldErrors.email && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Mot de passe *</label>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setField('password', e.target.value)}
                            disabled={isLoading}
                          />
                          {fieldErrors.password && (
                            <p className="text-sm text-destructive mt-1">{fieldErrors.password}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Confirmer le mot de passe *</label>
                          <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setField('confirmPassword', e.target.value)}
                            disabled={isLoading}
                          />
                          {fieldErrors.confirmPassword && (
                            <p className="text-sm text-destructive mt-1">{fieldErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Date de naissance</label>
                          <Input
                            type="date"
                            value={formData.dateNaissance}
                            onChange={(e) => setField('dateNaissance', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Telephone</label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setField('phone', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3 className="text-xl font-semibold">Experience professionnelle</h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">Domaine d'expertise *</label>
                        <Input
                          value={formData.expertise}
                          onChange={(e) => setField('expertise', e.target.value)}
                          placeholder="Ex: Developpement web, UX, Marketing"
                          disabled={isLoading}
                        />
                        {fieldErrors.expertise && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.expertise}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Annees d'experience *</label>
                        <Input
                          value={formData.experience}
                          onChange={(e) => setField('experience', e.target.value)}
                          placeholder="Ex: 3-5 ans"
                          disabled={isLoading}
                        />
                        {fieldErrors.experience && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.experience}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Formation *</label>
                        <Textarea
                          value={formData.education}
                          onChange={(e) => setField('education', e.target.value)}
                          rows={3}
                          disabled={isLoading}
                        />
                        {fieldErrors.education && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.education}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Bio professionnelle *</label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setField('bio', e.target.value)}
                          rows={4}
                          disabled={isLoading}
                        />
                        {fieldErrors.bio && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.bio}</p>
                        )}
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h3 className="text-xl font-semibold">Motivation et projets</h3>

                      <div>
                        <label className="block text-sm font-medium mb-2">Pourquoi voulez-vous enseigner ? *</label>
                        <Textarea
                          value={formData.motivation}
                          onChange={(e) => setField('motivation', e.target.value)}
                          rows={4}
                          disabled={isLoading}
                        />
                        {fieldErrors.motivation && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.motivation}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Idees de cours *</label>
                        <Textarea
                          value={formData.courseIdeas}
                          onChange={(e) => setField('courseIdeas', e.target.value)}
                          rows={4}
                          disabled={isLoading}
                        />
                        {fieldErrors.courseIdeas && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.courseIdeas}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Style d'enseignement</label>
                        <Textarea
                          value={formData.teachingStyle}
                          onChange={(e) => setField('teachingStyle', e.target.value)}
                          rows={3}
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-between mt-8">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                        Precedent
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button type="submit" className="ml-auto" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {submitLabel}
                      {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
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
