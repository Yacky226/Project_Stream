import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useTranslation } from '../../lib/i18n';
import { Shield, FileText, Clock, Lock, Eye, UserCheck, AlertTriangle } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: `Stream Éducatif s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre plateforme d'apprentissage en ligne.

Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi française sur la protection des données.`
    },
    {
      id: 'data-collected',
      title: '2. Données collectées',
      content: `Nous collectons différents types de données :

Données d'identification :
• Nom, prénom, adresse email
• Numéro de téléphone (optionnel)
• Date de naissance (pour vérifier l'âge)
• Photo de profil (optionnelle)

Données d'utilisation :
• Historique de navigation sur la plateforme
• Progression dans les cours
• Temps passé sur les vidéos
• Interactions avec les enseignants et autres étudiants
• Données de performance (quiz, exercices)

Données techniques :
• Adresse IP
• Type de navigateur et version
• Système d'exploitation
• Données de géolocalisation approximative
• Cookies et technologies similaires`
    },
    {
      id: 'data-usage',
      title: '3. Utilisation des données',
      content: `Nous utilisons vos données pour :

Fourniture du service :
• Créer et gérer votre compte
• Personnaliser votre expérience d'apprentissage
• Suivre votre progression
• Faciliter les interactions avec les enseignants

Amélioration du service :
• Analyser l'utilisation de la plateforme
• Développer de nouvelles fonctionnalités
• Optimiser les performances
• Résoudre les problèmes techniques

Communication :
• Envoyer des notifications importantes
• Répondre à vos demandes de support
• Partager des mises à jour du service (avec votre consentement)
• Envoyer des communications marketing (avec votre consentement)`
    },
    {
      id: 'data-sharing',
      title: '4. Partage des données',
      content: `Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données dans les cas suivants :

Avec les enseignants :
• Nom et progression pour le suivi pédagogique
• Réponses aux exercices et quiz
• Participation aux discussions

Avec nos partenaires :
• Processeurs de paiement (données nécessaires au traitement)
• Services d'hébergement cloud (données chiffrées)
• Outils d'analyse (données anonymisées)

Obligations légales :
• Réponse aux demandes légales des autorités
• Protection de nos droits et de notre sécurité
• Prévention de la fraude

Avec votre consentement :
• Partenaires éducatifs pour des programmes spéciaux
• Employeurs pour la validation de certifications`
    },
    {
      id: 'data-protection',
      title: '5. Protection des données',
      content: `Nous mettons en place des mesures de sécurité robustes :

Mesures techniques :
• Chiffrement SSL/TLS pour toutes les communications
• Chiffrement des données sensibles en base
• Surveillance 24/7 de nos systèmes
• Sauvegardes régulières et sécurisées
• Tests de sécurité réguliers

Mesures organisationnelles :
• Formation du personnel à la sécurité
• Accès limité aux données sur la base du besoin
• Politiques strictes de confidentialité
• Audits de sécurité réguliers
• Procédures de réponse aux incidents`
    },
    {
      id: 'cookies',
      title: '6. Cookies et technologies similaires',
      content: `Nous utilisons des cookies pour améliorer votre expérience :

Cookies essentiels :
• Maintien de la session utilisateur
• Préférences de sécurité
• Fonctionnalités de base de la plateforme

Cookies d'analyse :
• Google Analytics (données anonymisées)
• Mesure de performance
• Compréhension de l'utilisation

Cookies de préférences :
• Langue préférée
• Thème d'affichage
• Paramètres d'accessibilité

Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.`
    },
    {
      id: 'your-rights',
      title: '7. Vos droits',
      content: `Conformément au RGPD, vous disposez des droits suivants :

Droit d'accès :
• Obtenir une copie de vos données personnelles
• Connaître l'utilisation qui en est faite

Droit de rectification :
• Corriger des données inexactes
• Compléter des données incomplètes

Droit à l'effacement :
• Demander la suppression de vos données
• "Droit à l'oubli" dans certaines conditions

Droit à la portabilité :
• Récupérer vos données dans un format standard
• Transférer vos données à un autre service

Droit d'opposition :
• Vous opposer au traitement de vos données
• Particulièrement pour le marketing direct

Pour exercer ces droits, contactez-nous à privacy@stream-educatif.fr`
    },
    {
      id: 'retention',
      title: '8. Conservation des données',
      content: `Nous conservons vos données selon les principes suivants :

Données de compte :
• Tant que votre compte est actif
• 3 ans après la dernière connexion
• Suppression sur demande

Données d'apprentissage :
• Pendant la durée du cours + 5 ans
• Pour la validation des certifications
• Archivage sécurisé après cette période

Données de communication :
• Emails : 3 ans
• Messages de support : 5 ans
• Données marketing : jusqu'au retrait du consentement

Données légales :
• Durée requise par la loi
• Généralement 6 à 10 ans selon le type`
    },
    {
      id: 'minors',
      title: '9. Protection des mineurs',
      content: `Nous accordons une attention particulière à la protection des mineurs :

• Âge minimum requis : 16 ans
• Consentement parental requis pour les 13-16 ans
• Collecte de données limitée pour les mineurs
• Paramètres de confidentialité renforcés
• Modération accrue des contenus
• Formation spéciale du personnel sur la protection des mineurs

Les parents peuvent à tout moment demander l'accès, la rectification ou la suppression des données de leur enfant.`
    },
    {
      id: 'updates',
      title: '10. Mises à jour de cette politique',
      content: `Cette politique peut être mise à jour pour refléter :

• Évolutions légales et réglementaires
• Nouvelles fonctionnalités de la plateforme
• Amélioration de nos pratiques de protection
• Retours d'expérience et audits

En cas de modification importante :
• Notification par email 30 jours avant
• Publication sur la plateforme
• Possibilité de refuser et de supprimer le compte
• Conservation de l'ancienne version pour référence`
    }
  ];

  const quickLinks = [
    { title: 'Gérer mes cookies', action: () => alert('Paramètres de cookies (à implémenter)') },
    { title: 'Télécharger mes données', action: () => alert('Export de données (à implémenter)') },
    { title: 'Supprimer mon compte', action: () => onNavigate('/settings') },
    { title: 'Contacter le DPO', action: () => onNavigate('/contact') }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 mr-4" />
              <h1 className="text-4xl md:text-5xl">Politique de confidentialité</h1>
            </div>
            <p className="text-xl text-green-100 mb-4">
              Dernière mise à jour : 15 janvier 2024
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Conforme RGPD
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Table of Contents */}
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

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCheck className="w-5 h-5 mr-2" />
                      Actions rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quickLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={link.action}
                      >
                        {link.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Contact DPO */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <Lock className="w-5 h-5 mr-2" />
                      Contact DPO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Questions sur vos données ? Contactez notre Délégué à la Protection des Données.
                    </p>
                    <Button size="sm" onClick={() => onNavigate('/contact')}>
                      Contacter le DPO
                    </Button>
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
                      Version 3.2
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Conforme RGPD
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Chez Stream Éducatif, nous prenons la protection de vos données personnelles très au sérieux. 
                    Cette politique explique en détail comment nous collectons, utilisons, protégeons et 
                    respectons vos droits concernant vos données personnelles.
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
                  <h3 className="font-semibold mb-4">Questions sur cette politique ?</h3>
                  <p className="text-muted-foreground mb-4">
                    Si vous avez des questions concernant notre politique de confidentialité ou 
                    l'utilisation de vos données, n'hésitez pas à nous contacter.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => onNavigate('/contact')}>
                      Nous contacter
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onNavigate('/terms')}
                    >
                      Conditions d'utilisation
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