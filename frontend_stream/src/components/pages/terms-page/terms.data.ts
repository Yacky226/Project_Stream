import type { TermsPageDataModel } from './terms.types';

export const TERMS_PAGE_DATA: TermsPageDataModel = {
  lastUpdated: '15 janvier 2024',
  version: '2.1',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptation des conditions',
      content:
        "En accedant et en utilisant Stream Educatif, vous acceptez d'etre lie par ces conditions d'utilisation. Si vous n'acceptez pas toutes les conditions enoncees, vous ne pouvez pas utiliser nos services.",
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      content: `- "Service" designe la plateforme Stream Educatif et tous ses services associes
- "Utilisateur" designe toute personne qui accede ou utilise nos services
- "Contenu" designe tout materiel publie sur notre plateforme
- "Compte" designe votre compte utilisateur sur notre plateforme`,
    },
    {
      id: 'registration',
      title: '3. Inscription et compte utilisateur',
      content: `Pour utiliser certaines fonctionnalites, vous devez creer un compte. Vous etes responsable de :
- Fournir des informations exactes et completes
- Maintenir la securite de votre mot de passe
- Toutes les activites effectuees sous votre compte
- Nous informer immediatement de toute utilisation non autorisee`,
    },
    {
      id: 'usage',
      title: '4. Utilisation acceptable',
      content: `Vous vous engagez a :
- Utiliser nos services conformement a la loi
- Respecter les droits d'autrui
- Ne pas porter atteinte a la securite de nos systemes
- Ne pas utiliser notre service a des fins commerciales sans autorisation
- Ne pas partager vos identifiants de connexion`,
    },
    {
      id: 'content',
      title: '5. Contenu et propriete intellectuelle',
      content: `- Tout le contenu de la plateforme est protege par des droits d'auteur
- Vous ne pouvez pas reproduire, distribuer ou modifier notre contenu sans autorisation
- En publiant du contenu, vous nous accordez une licence d'utilisation
- Vous restez proprietaire du contenu que vous creez`,
    },
    {
      id: 'payments',
      title: '6. Paiements et remboursements',
      content: `- Les prix sont indiques en euros TTC
- Les paiements sont traites de maniere securisee
- Politique de remboursement de 30 jours pour les cours
- Les frais de traitement ne sont pas remboursables
- Nous nous reservons le droit de modifier nos prix`,
    },
    {
      id: 'privacy',
      title: '7. Protection des donnees',
      content:
        "Nous nous engageons a proteger vos donnees personnelles conformement au RGPD. Consultez notre politique de confidentialite pour plus de details sur la collecte, l'utilisation et la protection de vos donnees.",
    },
    {
      id: 'termination',
      title: '8. Resiliation',
      content: `- Vous pouvez supprimer votre compte a tout moment
- Nous pouvons suspendre ou resilier votre compte en cas de violation
- Certaines clauses survivent a la resiliation
- Les donnees peuvent etre conservees selon nos obligations legales`,
    },
    {
      id: 'liability',
      title: '9. Limitation de responsabilite',
      content: `- Nos services sont fournis "en l'etat"
- Nous ne garantissons pas un service ininterrompu
- Notre responsabilite est limitee dans la mesure permise par la loi
- Vous utilisez nos services a vos propres risques`,
    },
    {
      id: 'modifications',
      title: '10. Modifications des conditions',
      content:
        "Nous nous reservons le droit de modifier ces conditions a tout moment. Les modifications importantes seront notifiees par email ou sur la plateforme. L'utilisation continue de nos services constitue une acceptation des nouvelles conditions.",
    },
    {
      id: 'contact',
      title: '11. Contact',
      content: `Pour toute question concernant ces conditions d'utilisation, contactez-nous a :
- Email : legal@stream-educatif.fr
- Adresse : 123 Avenue de l'Innovation, 75001 Paris, France
- Telephone : +33 1 23 45 67 89`,
    },
  ],
};
