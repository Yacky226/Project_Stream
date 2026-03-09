import { ChatbotResponse } from '../types/chatbot';

/**
 * Service de chatbot avec réponses intelligentes
 * Peut être étendu pour intégrer une vraie IA (OpenAI, Claude, etc.)
 */

interface ChatContext {
  userRole: 'student' | 'teacher' | 'admin';
  currentPage?: string;
  userName?: string;
}

// Base de connaissances
const knowledgeBase = {
  student: {
    enrollment: {
      keywords: ['inscrire', 'inscription', 'cours', 'rejoindre', 'commencer'],
      response: `Pour vous inscrire à un cours :
1. Parcourez le catalogue des cours
2. Cliquez sur le cours qui vous intéresse
3. Cliquez sur le bouton "S'inscrire"
4. Suivez les instructions de paiement si nécessaire

Souhaitez-vous que je vous guide vers le catalogue de cours ?`
    },
    courses: {
      keywords: ['mes cours', 'cours en cours', 'progression', 'continuer'],
      response: `Vous pouvez accéder à vos cours depuis :
- Votre tableau de bord étudiant
- L'onglet "Mes Cours" en haut de la page
- La section "Continuer l'apprentissage" sur la page d'accueil

Voulez-vous que je vous y dirige ?`
    },
    live: {
      keywords: ['session live', 'direct', 'streaming', 'rejoindre live'],
      response: `Pour rejoindre une session live :
1. Allez dans "Sessions Live" depuis le menu
2. Trouvez la session qui est en cours ou planifiée
3. Cliquez sur "Rejoindre" quand la session commence

Les sessions live sont indiquées par un badge rouge "🔴 Live".`
    },
    certificates: {
      keywords: ['certificat', 'certification', 'diplôme'],
      response: `Les certificats sont disponibles une fois que vous avez :
- Terminé 100% du cours
- Réussi les quiz avec au moins 70%
- Participé aux évaluations finales

Vous pouvez les télécharger depuis votre profil, section "Réalisations".`
    }
  },
  teacher: {
    createCourse: {
      keywords: ['créer cours', 'nouveau cours', 'ajouter cours'],
      response: `Pour créer un nouveau cours :
1. Allez sur votre tableau de bord enseignant
2. Cliquez sur "Nouveau Cours"
3. Remplissez les informations (titre, description, niveau)
4. Ajoutez votre contenu (vidéos, documents, quiz)
5. Publiez le cours

Besoin d'aide avec une étape spécifique ?`
    },
    liveSession: {
      keywords: ['session live', 'direct', 'streaming', 'créer live'],
      response: `Pour créer une session live :
1. Allez dans "Mes Sessions" ou votre dashboard
2. Cliquez sur "Planifier une Session Live"
3. Configurez la date, l'heure et le cours associé
4. Testez votre caméra et micro avant de commencer
5. Démarrez la session à l'heure prévue

Le système vous guidera pour la configuration technique.`
    },
    students: {
      keywords: ['étudiants', 'élèves', 'participants', 'inscrits'],
      response: `Vous pouvez gérer vos étudiants depuis :
- Votre dashboard enseignant, onglet "Étudiants"
- La page de chaque cours, section "Participants"

Vous y trouverez :
- La liste complète des inscrits
- Leur progression
- Les statistiques d'engagement`
    },
    analytics: {
      keywords: ['statistiques', 'analytics', 'performance', 'revenus'],
      response: `Vos statistiques sont disponibles sur votre dashboard :
- Nombre total d'étudiants
- Revenus mensuels
- Note moyenne de vos cours
- Temps de visionnage
- Taux de complétion

Toutes les métriques sont mises à jour en temps réel.`
    }
  },
  general: {
    help: {
      keywords: ['aide', 'help', 'aidez-moi', 'besoin d\'aide'],
      response: `Je suis là pour vous aider ! Voici ce que je peux faire :

📚 Répondre à vos questions sur l'utilisation de la plateforme
🎓 Vous guider dans vos cours et formations
🎥 Vous aider avec les sessions live
⚙️ Vous assister avec les paramètres
💬 Vous mettre en contact avec le support

Posez-moi n'importe quelle question !`
    },
    navigation: {
      keywords: ['aller', 'naviguer', 'accéder', 'où est'],
      response: `Je peux vous aider à naviguer sur la plateforme. Que cherchez-vous ?
- Catalogue de cours
- Mes cours
- Sessions live
- Profil
- Paramètres
- Dashboard

Dites-moi simplement où vous voulez aller.`
    },
    contact: {
      keywords: ['contact', 'support', 'email', 'aide humaine'],
      response: `Pour contacter notre équipe :
- Email : support@stream-educatif.com
- Formulaire de contact : Menu > Contact
- Chat en direct : Disponible 24/7 (vous y êtes !)

Pour les urgences techniques, utilisez le formulaire de contact avec la mention "URGENT".`
    },
    settings: {
      keywords: ['paramètres', 'réglages', 'configuration', 'compte'],
      response: `Vous pouvez gérer vos paramètres depuis :
- Votre profil (icône utilisateur en haut à droite)
- Menu "Paramètres"

Vous pouvez y modifier :
- Informations personnelles
- Préférences de notification
- Langue et fuseau horaire
- Confidentialité
- Sécurité (mot de passe, 2FA)`
    }
  }
};

// Réponses par défaut basées sur le rôle
const defaultResponses = {
  student: `Je n'ai pas bien compris votre question. En tant qu'étudiant, je peux vous aider avec :
- L'inscription aux cours
- Vos cours en cours
- Les sessions live
- Les certificats
- La navigation sur la plateforme

Pouvez-vous reformuler votre question ?`,
  teacher: `Je n'ai pas bien compris votre question. En tant qu'enseignant, je peux vous aider avec :
- La création de cours
- Les sessions live
- La gestion des étudiants
- Les statistiques et revenus
- La configuration de votre profil

Pouvez-vous préciser votre demande ?`,
  admin: `En tant qu'administrateur, vous avez accès à toutes les fonctionnalités. Comment puis-je vous assister ?`,
  default: `Je n'ai pas bien compris. Pouvez-vous reformuler votre question ? Je peux vous aider avec la navigation, les cours, les sessions live, et bien plus encore.`
};

/**
 * Génère une réponse basée sur le message de l'utilisateur
 */
export function generateChatbotResponse(
  message: string,
  context: ChatContext
): ChatbotResponse {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Salutations
  if (/^(bonjour|salut|hello|hi|hey)/.test(normalizedMessage)) {
    return {
      message: `Bonjour ${context.userName || ''} ! 👋 Comment puis-je vous aider aujourd'hui ?`,
      suggestions: context.userRole === 'student' 
        ? ['Voir mes cours', 'Prochaine session live', 'Aide inscription']
        : ['Créer un cours', 'Mes statistiques', 'Planifier une session']
    };
  }

  // Au revoir
  if (/^(au revoir|bye|à bientôt|merci)/.test(normalizedMessage)) {
    return {
      message: `Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions. Bon apprentissage ! 🎓`
    };
  }

  // Recherche dans la base de connaissances spécifique au rôle
  const roleKnowledge = knowledgeBase[context.userRole] || {};
  for (const [category, data] of Object.entries(roleKnowledge)) {
    if (data.keywords.some(keyword => normalizedMessage.includes(keyword))) {
      return {
        message: data.response,
        suggestions: getSuggestions(category, context.userRole)
      };
    }
  }

  // Recherche dans la base générale
  for (const [category, data] of Object.entries(knowledgeBase.general)) {
    if (data.keywords.some(keyword => normalizedMessage.includes(keyword))) {
      return {
        message: data.response,
        suggestions: getSuggestions(category, context.userRole)
      };
    }
  }

  // Actions rapides
  if (normalizedMessage.includes('catalogue')) {
    return {
      message: `Je vous redirige vers le catalogue de cours...`,
      action: {
        type: 'navigate',
        payload: '/catalog'
      }
    };
  }

  if (normalizedMessage.includes('dashboard') || normalizedMessage.includes('tableau de bord')) {
    const path = context.userRole === 'teacher' ? '/teacher/dashboard' : '/dashboard';
    return {
      message: `Je vous redirige vers votre tableau de bord...`,
      action: {
        type: 'navigate',
        payload: path
      }
    };
  }

  if (normalizedMessage.includes('profil')) {
    return {
      message: `Je vous redirige vers votre profil...`,
      action: {
        type: 'navigate',
        payload: '/profile'
      }
    };
  }

  // Réponse par défaut
  return {
    message: defaultResponses[context.userRole] || defaultResponses.default,
    suggestions: getDefaultSuggestions(context.userRole)
  };
}

/**
 * Obtient des suggestions contextuelles
 */
function getSuggestions(category: string, role: string): string[] {
  const suggestions: Record<string, string[]> = {
    enrollment: ['Aller au catalogue', 'Mes cours', 'Aide'],
    courses: ['Voir mes cours', 'Continuer un cours', 'Certificats'],
    live: ['Voir les lives', 'Planifier un live', 'Aide technique'],
    createCourse: ['Créer un cours', 'Mes cours', 'Aide'],
    liveSession: ['Planifier', 'Mes sessions', 'Guide streaming'],
    students: ['Voir étudiants', 'Statistiques', 'Exporter données'],
    help: ['FAQ', 'Contact support', 'Tutoriels'],
    navigation: ['Retour accueil', 'Catalogue', 'Dashboard'],
    contact: ['Envoyer email', 'FAQ', 'Tutoriels']
  };

  return suggestions[category] || getDefaultSuggestions(role);
}

/**
 * Suggestions par défaut selon le rôle
 */
function getDefaultSuggestions(role: string): string[] {
  const defaults: Record<string, string[]> = {
    student: ['Mes cours', 'Sessions live', 'Catalogue', 'Aide'],
    teacher: ['Créer un cours', 'Mes sessions', 'Statistiques', 'Aide'],
    admin: ['Utilisateurs', 'Statistiques', 'Configuration', 'Aide']
  };

  return defaults[role] || ['Aide', 'Accueil'];
}

/**
 * Simule un délai de réponse pour un effet plus naturel
 */
export async function getChatbotResponseAsync(
  message: string,
  context: ChatContext
): Promise<ChatbotResponse> {
  // Simule un délai de réponse (500-1500ms)
  const delay = Math.random() * 1000 + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return generateChatbotResponse(message, context);
}
