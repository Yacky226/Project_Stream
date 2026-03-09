import { useState } from 'react';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../lib/i18n';
import { 
  Search, 
  HelpCircle, 
  Users, 
  BookOpen, 
  CreditCard, 
  Settings,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface FAQPageProps {
  onNavigate: (path: string) => void;
}

export function FAQPage({ onNavigate }: FAQPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Toutes', icon: HelpCircle, count: 24 },
    { id: 'general', name: 'Général', icon: Users, count: 8 },
    { id: 'courses', name: 'Cours', icon: BookOpen, count: 6 },
    { id: 'payment', name: 'Paiement', icon: CreditCard, count: 5 },
    { id: 'technical', name: 'Technique', icon: Settings, count: 5 }
  ];

  const faqs = [
    {
      id: '1',
      category: 'general',
      question: 'Comment créer un compte sur Stream Éducatif ?',
      answer: 'Pour créer un compte, cliquez sur "S\'inscrire" en haut à droite de la page. Remplissez le formulaire avec vos informations personnelles et choisissez votre rôle (étudiant ou enseignant). Vous recevrez un email de confirmation pour activer votre compte.'
    },
    {
      id: '2',
      category: 'general',
      question: 'Stream Éducatif est-il gratuit ?',
      answer: 'Stream Éducatif propose une inscription gratuite avec accès à certains cours gratuits. Cependant, la plupart des cours premium nécessitent un achat ou un abonnement. Nous proposons aussi une période d\'essai gratuite de 7 jours pour découvrir nos fonctionnalités premium.'
    },
    {
      id: '3',
      category: 'courses',
      question: 'Comment accéder aux sessions live ?',
      answer: 'Les sessions live sont accessibles depuis votre tableau de bord étudiant. Vous recevrez une notification 15 minutes avant le début de chaque session. Cliquez simplement sur "Rejoindre" pour accéder à la salle virtuelle.'
    },
    {
      id: '4',
      category: 'courses',
      question: 'Puis-je télécharger les vidéos de cours ?',
      answer: 'Les vidéos peuvent être visionnées en streaming sur notre plateforme. Certains cours premium offrent la possibilité de télécharger les vidéos pour un visionnage hors ligne via notre application mobile.'
    },
    {
      id: '5',
      category: 'payment',
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes de crédit/débit (Visa, MasterCard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés avec un cryptage SSL 256 bits.'
    },
    {
      id: '6',
      category: 'payment',
      question: 'Puis-je obtenir un remboursement ?',
      answer: 'Oui, nous offrons une garantie de remboursement de 30 jours sur tous nos cours. Si vous n\'êtes pas satisfait, contactez notre support client avec votre numéro de commande.'
    },
    {
      id: '7',
      category: 'technical',
      question: 'Quels sont les pré-requis techniques ?',
      answer: 'Vous avez besoin d\'une connexion internet stable (minimum 5 Mbps), d\'un navigateur moderne (Chrome, Firefox, Safari, Edge) et d\'un système audio/vidéo pour les sessions interactives.'
    },
    {
      id: '8',
      category: 'technical',
      question: 'L\'application mobile est-elle disponible ?',
      answer: 'Oui, notre application mobile est disponible sur iOS et Android. Elle permet d\'accéder aux cours, de participer aux sessions live et de télécharger du contenu pour un visionnage hors ligne.'
    },
    {
      id: '9',
      category: 'general',
      question: 'Comment devenir enseignant sur la plateforme ?',
      answer: 'Pour devenir enseignant, créez un compte enseignant et soumettez votre candidature avec vos qualifications. Notre équipe examine chaque demande et vous contactera sous 5-7 jours ouvrables.'
    },
    {
      id: '10',
      category: 'courses',
      question: 'Obtiendrai-je un certificat à la fin du cours ?',
      answer: 'Oui, vous recevrez un certificat de completion pour chaque cours terminé avec succès. Ces certificats sont reconnus par de nombreuses entreprises et peuvent être ajoutés à votre profil LinkedIn.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl mb-4">Centre d'aide</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher dans les questions fréquentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold mb-4">Catégories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {/* Contact Support */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
                    <CardDescription>
                      Notre équipe support est là pour vous aider
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => onNavigate('/contact')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contacter le support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Questions fréquentes
                  {searchTerm && (
                    <span className="text-lg font-normal text-muted-foreground ml-2">
                      - Résultats pour "{searchTerm}"
                    </span>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {filteredFAQs.length} question(s) trouvée(s)
                </p>
              </div>

              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center">
                          <HelpCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 pl-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                    <p className="text-muted-foreground mb-4">
                      Essayez de modifier vos termes de recherche ou sélectionnez une autre catégorie.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Still need help */}
              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Vous ne trouvez pas votre réponse ?</h3>
                      <p className="text-muted-foreground">
                        Notre équipe support est disponible pour vous aider personnellement.
                      </p>
                    </div>
                    <Button onClick={() => onNavigate('/contact')}>
                      Nous contacter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}