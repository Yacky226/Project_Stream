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
      content: `En accédant et en utilisant Stream Éducatif, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas toutes les conditions énoncées, vous ne pouvez pas utiliser nos services.`
    },
    {
      id: 'definitions',
      title: '2. Définitions',
      content: `
• "Service" désigne la plateforme Stream Éducatif et tous ses services associés
• "Utilisateur" désigne toute personne qui accède ou utilise nos services
• "Contenu" désigne tout matériel publié sur notre plateforme
• "Compte" désigne votre compte utilisateur sur notre plateforme`
    },
    {
      id: 'registration',
      title: '3. Inscription et compte utilisateur',
      content: `Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de :
• Fournir des informations exactes et complètes
• Maintenir la sécurité de votre mot de passe
• Toutes les activités effectuées sous votre compte
• Nous informer immédiatement de toute utilisation non autorisée`
    },
    {
      id: 'usage',
      title: '4. Utilisation acceptable',
      content: `Vous vous engagez à :
• Utiliser nos services conformément à la loi
• Respecter les droits d'autrui
• Ne pas porter atteinte à la sécurité de nos systèmes
• Ne pas utiliser notre service à des fins commerciales sans autorisation
• Ne pas partager vos identifiants de connexion`
    },
    {
      id: 'content',
      title: '5. Contenu et propriété intellectuelle',
      content: `
• Tout le contenu de la plateforme est protégé par des droits d'auteur
• Vous ne pouvez pas reproduire, distribuer ou modifier notre contenu sans autorisation
• En publiant du contenu, vous nous accordez une licence d'utilisation
• Vous restez propriétaire du contenu que vous créez`
    },
    {
      id: 'payments',
      title: '6. Paiements et remboursements',
      content: `
• Les prix sont indiqués en euros TTC
• Les paiements sont traités de manière sécurisée
• Politique de remboursement de 30 jours pour les cours
• Les frais de traitement ne sont pas remboursables
• Nous nous réservons le droit de modifier nos prix`
    },
    {
      id: 'privacy',
      title: '7. Protection des données',
      content: `Nous nous engageons à protéger vos données personnelles conformément au RGPD. Consultez notre politique de confidentialité pour plus de détails sur la collecte, l'utilisation et la protection de vos données.`
    },
    {
      id: 'termination',
      title: '8. Résiliation',
      content: `
• Vous pouvez supprimer votre compte à tout moment
• Nous pouvons suspendre ou résilier votre compte en cas de violation
• Certaines clauses survivent à la résiliation
• Les données peuvent être conservées selon nos obligations légales`
    },
    {
      id: 'liability',
      title: '9. Limitation de responsabilité',
      content: `
• Nos services sont fournis "en l'état"
• Nous ne garantissons pas un service ininterrompu
• Notre responsabilité est limitée dans la mesure permise par la loi
• Vous utilisez nos services à vos propres risques`
    },
    {
      id: 'modifications',
      title: '10. Modifications des conditions',
      content: `Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email ou sur la plateforme. L'utilisation continue de nos services constitue une acceptation des nouvelles conditions.`
    },
    {
      id: 'contact',
      title: '11. Contact',
      content: `Pour toute question concernant ces conditions d'utilisation, contactez-nous à :
• Email : legal@stream-educatif.fr
• Adresse : 123 Avenue de l'Innovation, 75001 Paris, France
• Téléphone : +33 1 23 45 67 89`
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
              Dernière mise à jour : 15 janvier 2024
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
                      Mis à jour le 15 janvier 2024
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Version 2.1
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Bienvenue sur Stream Éducatif. Ces conditions d'utilisation régissent votre accès 
                    et votre utilisation de notre plateforme d'apprentissage en ligne. En utilisant nos 
                    services, vous acceptez ces conditions dans leur intégralité.
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
                    n'hésitez pas à nous contacter.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => onNavigate('/contact')}>
                      Nous contacter
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onNavigate('/privacy')}
                    >
                      Politique de confidentialité
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