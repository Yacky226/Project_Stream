import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useTranslation } from '../../lib/i18n';
import { Shield, FileText, Clock, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptation des conditions',
      content: `En accedant et en utilisant Stream Educatif, vous acceptez d'etre lie par ces conditions d'utilisation. Si vous n'acceptez pas toutes les conditions enoncees, vous ne pouvez pas utiliser nos services.`
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      content: `
• "Service" designe la plateforme Stream Educatif et tous ses services associes
• "Utilisateur" designe toute personne qui accede ou utilise nos services
• "Contenu" designe tout materiel publie sur notre plateforme
• "Compte" designe votre compte utilisateur sur notre plateforme`
    },
    {
      id: 'registration',
      title: '3. Inscription et compte utilisateur',
      content: `Pour utiliser certaines fonctionnalites, vous devez creer un compte. Vous etes responsable de :
• Fournir des informations exactes et completes
• Maintenir la securite de votre mot de passe
• Toutes les activites effectuees sous votre compte
• Nous informer immediatement de toute utilisation non autorisee`
    },
    {
      id: 'usage',
      title: '4. Utilisation acceptable',
      content: `Vous vous engagez a :
• Utiliser nos services conformement a la loi
• Respecter les droits d'autrui
• Ne pas porter atteinte a la securite de nos systemes
• Ne pas utiliser notre service a des fins commerciales sans autorisation
• Ne pas partager vos identifiants de connexion`
    },
    {
      id: 'content',
      title: '5. Contenu et propriete intellectuelle',
      content: `
• Tout le contenu de la plateforme est protege par des droits d'auteur
• Vous ne pouvez pas reproduire, distribuer ou modifier notre contenu sans autorisation
• En publiant du contenu, vous nous accordez une licence d'utilisation
• Vous restez proprietaire du contenu que vous creez`
    },
    {
      id: 'payments',
      title: '6. Paiements et remboursements',
      content: `
• Les prix sont indiques en euros TTC
• Les paiements sont traites de maniere securisee
• Politique de remboursement de 30 jours pour les cours
• Les frais de traitement ne sont pas remboursables
• Nous nous reservons le droit de modifier nos prix`
    },
    {
      id: 'privacy',
      title: '7. Protection des donnees',
      content: `Nous nous engageons a proteger vos donnees personnelles conformement au RGPD. Consultez notre politique de confidentialite pour plus de details sur la collecte, l'utilisation et la protection de vos donnees.`
    },
    {
      id: 'termination',
      title: '8. Resiliation',
      content: `
• Vous pouvez supprimer votre compte a tout moment
• Nous pouvons suspendre ou resilier votre compte en cas de violation
• Certaines clauses survivent a la resiliation
• Les donnees peuvent etre conservees selon nos obligations legales`
    },
    {
      id: 'liability',
      title: '9. Limitation de responsabilite',
      content: `
• Nos services sont fournis "en l'etat"
• Nous ne garantissons pas un service ininterrompu
• Notre responsabilite est limitee dans la mesure permise par la loi
• Vous utilisez nos services a vos propres risques`
    },
    {
      id: 'modifications',
      title: '10. Modifications des conditions',
      content: `Nous nous reservons le droit de modifier ces conditions a tout moment. Les modifications importantes seront notifiees par email ou sur la plateforme. L'utilisation continue de nos services constitue une acceptation des nouvelles conditions.`
    },
    {
      id: 'contact',
      title: '11. Contact',
      content: `Pour toute question concernant ces conditions d'utilisation, contactez-nous a :
• Email : legal@stream-educatif.fr
• Adresse : 123 Avenue de l'Innovation, 75001 Paris, France
• Telephone : +33 1 23 45 67 89`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-4">Conditions d'utilisation</h1>
            <p className="text-xl text-blue-100">
              Derniere mise a jour : 15 janvier 2024
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Sommaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                        >
                          {section.title}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Important Notice */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Important
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Ces conditions sont juridiquement contraignantes. 
                      Veuillez les lire attentivement avant d'utiliser nos services.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="max-w-4xl">
                {/* Header Info */}
                <div className="mb-8">
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Mis a jour le 15 janvier 2024
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Version 2.1
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Bienvenue sur Stream Educatif. Ces conditions d'utilisation regissent votre acces 
                    et votre utilisation de notre plateforme d'apprentissage en ligne. En utilisant nos 
                    services, vous acceptez ces conditions dans leur integralite.
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                  {sections.map((section) => (
                    <div key={section.id} id={section.id}>
                      <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                      <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                      {section.id !== sections[sections.length - 1].id && (
                        <Separator className="mt-8" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-12 p-6 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-4">Questions sur ces conditions ?</h3>
                  <p className="text-muted-foreground mb-4">
                    Si vous avez des questions concernant ces conditions d'utilisation, 
                    n'hesitez pas a nous contacter.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => onNavigate('/contact')}>
                      Nous contacter
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onNavigate('/privacy')}
                    >
                      Politique de confidentialite
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onNavigate('/faq')}
                    >
                      FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}