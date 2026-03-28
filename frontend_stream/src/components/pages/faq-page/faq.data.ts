import { BookOpen, CreditCard, HelpCircle, Settings, Users } from 'lucide-react';
import type { FAQCategory, FAQItem } from './faq.types';

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'all', name: 'Toutes', icon: HelpCircle, count: 24 },
  { id: 'general', name: 'General', icon: Users, count: 8 },
  { id: 'courses', name: 'Cours', icon: BookOpen, count: 6 },
  { id: 'payment', name: 'Paiement', icon: CreditCard, count: 5 },
  { id: 'technical', name: 'Technique', icon: Settings, count: 5 },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    question: 'Comment creer un compte sur Stream Educatif ?',
    answer:
      'Pour creer un compte, cliquez sur "S\'inscrire" en haut a droite de la page. Remplissez le formulaire avec vos informations personnelles et choisissez votre role (etudiant ou enseignant). Vous recevrez un email de confirmation pour activer votre compte.',
  },
  {
    id: '2',
    category: 'general',
    question: 'Stream Educatif est-il gratuit ?',
    answer:
      "Stream Educatif propose une inscription gratuite avec acces a certains cours gratuits. Cependant, la plupart des cours premium necessitent un achat ou un abonnement. Nous proposons aussi une periode d'essai gratuite de 7 jours pour decouvrir nos fonctionnalites premium.",
  },
  {
    id: '3',
    category: 'courses',
    question: 'Comment acceder aux sessions live ?',
    answer:
      'Les sessions live sont accessibles depuis votre tableau de bord etudiant. Vous recevrez une notification 15 minutes avant le debut de chaque session. Cliquez simplement sur "Rejoindre" pour acceder a la salle virtuelle.',
  },
  {
    id: '4',
    category: 'courses',
    question: 'Puis-je telecharger les videos de cours ?',
    answer:
      'Les videos peuvent etre visionnees en streaming sur notre plateforme. Certains cours premium offrent la possibilite de telecharger les videos pour un visionnage hors ligne via notre application mobile.',
  },
  {
    id: '5',
    category: 'payment',
    question: 'Quels modes de paiement acceptez-vous ?',
    answer:
      'Nous acceptons les cartes de credit/debit (Visa, MasterCard, American Express), PayPal, et les virements bancaires. Tous les paiements sont securises avec un cryptage SSL 256 bits.',
  },
  {
    id: '6',
    category: 'payment',
    question: 'Puis-je obtenir un remboursement ?',
    answer:
      "Oui, nous offrons une garantie de remboursement de 30 jours sur tous nos cours. Si vous n'etes pas satisfait, contactez notre support client avec votre numero de commande.",
  },
  {
    id: '7',
    category: 'technical',
    question: 'Quels sont les pre-requis techniques ?',
    answer:
      "Vous avez besoin d'une connexion internet stable (minimum 5 Mbps), d'un navigateur moderne (Chrome, Firefox, Safari, Edge) et d'un systeme audio/video pour les sessions interactives.",
  },
  {
    id: '8',
    category: 'technical',
    question: "L'application mobile est-elle disponible ?",
    answer:
      "Oui, notre application mobile est disponible sur iOS et Android. Elle permet d'acceder aux cours, de participer aux sessions live et de telecharger du contenu pour un visionnage hors ligne.",
  },
  {
    id: '9',
    category: 'general',
    question: 'Comment devenir enseignant sur la plateforme ?',
    answer:
      'Pour devenir enseignant, creez un compte enseignant et soumettez votre candidature avec vos qualifications. Notre equipe examine chaque demande et vous contactera sous 5-7 jours ouvrables.',
  },
  {
    id: '10',
    category: 'courses',
    question: 'Obtiendrai-je un certificat a la fin du cours ?',
    answer:
      'Oui, vous recevrez un certificat de completion pour chaque cours termine avec succes. Ces certificats sont reconnus par de nombreuses entreprises et peuvent etre ajoutes a votre profil LinkedIn.',
  },
];
