import {
  Brain,
  Contrast,
  Ear,
  Eye,
  Hand,
  Keyboard,
  Settings,
  Type,
  Volume2,
  ZoomIn,
} from 'lucide-react';
import type { AccessibilityPageDataModel } from './accessibility.types';

export const ACCESSIBILITY_PAGE_DATA: AccessibilityPageDataModel = {
  features: [
    {
      category: 'Vision',
      icon: Eye,
      colorClass: 'text-blue-600',
      backgroundClass: 'bg-blue-100',
      items: [
        "Support des lecteurs d'ecran (NVDA, JAWS, VoiceOver)",
        'Contraste eleve et themes sombres',
        'Tailles de police ajustables',
        'Navigation au clavier complete',
        'Descriptions alternatives pour les images',
        'Sous-titres pour toutes les videos',
      ],
    },
    {
      category: 'Audition',
      icon: Ear,
      colorClass: 'text-green-600',
      backgroundClass: 'bg-green-100',
      items: [
        'Sous-titres automatiques et manuels',
        'Transcriptions completes des cours',
        'Alertes visuelles pour les notifications',
        'Langue des signes pour les cours principaux',
        'Controle precis du volume',
        'Interface visuelle pour le chat vocal',
      ],
    },
    {
      category: 'Motricite',
      icon: Hand,
      colorClass: 'text-purple-600',
      backgroundClass: 'bg-purple-100',
      items: [
        'Navigation complete au clavier',
        'Commandes vocales disponibles',
        'Boutons et zones cliquables elargis',
        'Temps de reaction prolonges',
        'Alternatives aux glisser-deposer',
        'Support des contacteurs externes',
      ],
    },
    {
      category: 'Cognition',
      icon: Brain,
      colorClass: 'text-orange-600',
      backgroundClass: 'bg-orange-100',
      items: [
        'Interface simplifiee disponible',
        'Progression sauvegardee automatiquement',
        'Rappels et notifications personnalisables',
        'Vitesse de lecture ajustable',
        'Mode focus sans distractions',
        'Aide contextuelle omnipresente',
      ],
    },
  ],
  standards: [
    {
      name: 'WCAG 2.1 AA',
      description: "Conforme aux directives d'accessibilite du contenu web",
      status: 'Certifie',
      level: 'AA',
    },
    {
      name: 'Section 508',
      description: "Conforme aux standards d'accessibilite americains",
      status: 'Conforme',
      level: 'Complet',
    },
    {
      name: 'EN 301 549',
      description: "Standard europeen d'accessibilite numerique",
      status: 'Certifie',
      level: 'V3.2.1',
    },
    {
      name: 'RGAA 4.1',
      description: "Referentiel general d'amelioration de l'accessibilite",
      status: 'Conforme',
      level: 'AA',
    },
  ],
  tools: [
    {
      name: "Lecteurs d'ecran",
      description: 'NVDA, JAWS, VoiceOver, TalkBack',
      icon: Volume2,
      compatibility: '100%',
    },
    {
      name: 'Navigation clavier',
      description: 'Toutes les fonctions accessibles au clavier',
      icon: Keyboard,
      compatibility: '100%',
    },
    {
      name: "Loupes d'ecran",
      description: 'ZoomText, Loupe Windows, Zoom',
      icon: ZoomIn,
      compatibility: '100%',
    },
    {
      name: 'Contraste eleve',
      description: "Themes et modes d'affichage adaptes",
      icon: Contrast,
      compatibility: '100%',
    },
  ],
  reportChannels: [
    'Email: accessibilite@stream-educatif.fr',
    'Telephone: +33 1 23 45 67 89',
    'Formulaire de contact en ligne',
    'Chat en direct sur la plateforme',
  ],
  reportDetails: [
    'Description detaillee du probleme',
    'Page ou section concernee',
    'Navigateur et systeme utilises',
    "Outils d'assistance utilises",
  ],
  improvements: [
    {
      title: 'IA de transcription',
      description: 'Transcription automatique amelioree avec ponctuation intelligente',
      icon: Type,
      colorClass: 'text-blue-600',
    },
    {
      title: 'Personnalisation cognitive',
      description: 'Interface adaptive selon les besoins cognitifs specifiques',
      icon: Brain,
      colorClass: 'text-purple-600',
    },
    {
      title: 'Controles avances',
      description: "Parametres d'accessibilite plus granulaires et personnalisables",
      icon: Settings,
      colorClass: 'text-green-600',
    },
  ],
};
