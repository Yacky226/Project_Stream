import { ChatbotResponse } from '../types/chatbot';
import { createChatbotService } from './chatbotApiService';
import {
  ChatMessage as ApiChatMessage,
  ChatbotProvider,
  defaultConfig,
  isBackendProxyEnabled,
  isApiKeyConfigured,
  isStrictApiModeEnabled,
} from './chatbotConfig';

/**
 * Service de chatbot avec reponses intelligentes
 * Peut etre etendu pour integrer une vraie IA (OpenAI, Claude, etc.)
 */

interface ChatContext {
  userRole: 'student' | 'teacher' | 'admin';
  currentPage?: string;
  userName?: string;
  conversationHistory?: ApiChatMessage[];
}

let activeProvider: ChatbotProvider = defaultConfig.provider;
let apiChatbotService = createChatbotService(activeProvider);

function canCallApiProvider(): boolean {
  if (activeProvider === 'mock') {
    return false;
  }

  if (isBackendProxyEnabled()) {
    return true;
  }

  return isApiKeyConfigured(activeProvider);
}

function getConversationHistory(context: ChatContext): ApiChatMessage[] {
  const history = context.conversationHistory || [];
  return history
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .slice(-12);
}

async function waitLocalDelay() {
  const delay = Math.random() * 1000 + 500;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function getActiveChatbotProvider(): ChatbotProvider {
  return activeProvider;
}

export function switchChatbotProvider(provider: ChatbotProvider, apiKey?: string): void {
  if (isStrictApiModeEnabled() && provider === 'mock') {
    console.warn('Strict API mode enabled: mock provider switch ignored.');
    return;
  }

  activeProvider = provider;
  apiChatbotService = createChatbotService(provider, apiKey);
}

function buildStrictApiUnavailableResponse(): ChatbotResponse {
  return {
    message:
      'Strict API mode is enabled. Configure a real AI provider and valid API key to continue.',
    source: 'fallback',
    provider: 'local',
  };
}

function buildStrictApiErrorResponse(): ChatbotResponse {
  return {
    message:
      'The AI provider is unavailable right now. Local fallback is blocked in strict API mode. Please retry.',
    source: 'fallback',
    provider: 'local',
  };
}

// Base de connaissances
const knowledgeBase = {
  student: {
    enrollment: {
      keywords: ['inscrire', 'inscription', 'cours', 'rejoindre', 'commencer'],
      response: `Pour vous inscrire a un cours :
1. Parcourez le catalogue des cours
2. Cliquez sur le cours qui vous interesse
3. Cliquez sur le bouton "S'inscrire"
4. Suivez les instructions de paiement si necessaire

Souhaitez-vous que je vous guide vers le catalogue de cours ?`
    },
    courses: {
      keywords: ['mes cours', 'cours en cours', 'progression', 'continuer'],
      response: `Vous pouvez acceder a vos cours depuis :
- Votre tableau de bord etudiant
- L'onglet "Mes Cours" en haut de la page
- La section "Continuer l'apprentissage" sur la page d'accueil

Voulez-vous que je vous y dirige ?`
    },
    live: {
      keywords: ['session live', 'direct', 'streaming', 'rejoindre live'],
      response: `Pour rejoindre une session live :
1. Allez dans "Sessions Live" depuis le menu
2. Trouvez la session qui est en cours ou planifiee
3. Cliquez sur "Rejoindre" quand la session commence

Les sessions live sont indiquees par un badge rouge "🔴 Live".`
    },
    certificates: {
      keywords: ['certificat', 'certification', 'diplome'],
      response: `Les certificats sont disponibles une fois que vous avez :
- Termine 100% du cours
- Reussi les quiz avec au moins 70%
- Participe aux evaluations finales

Vous pouvez les telecharger depuis votre profil, section "Realisations".`
    }
  },
  teacher: {
    createCourse: {
      keywords: ['creer cours', 'nouveau cours', 'ajouter cours'],
      response: `Pour creer un nouveau cours :
1. Allez sur votre tableau de bord enseignant
2. Cliquez sur "Nouveau Cours"
3. Remplissez les informations (titre, description, niveau)
4. Ajoutez votre contenu (videos, documents, quiz)
5. Publiez le cours

Besoin d'aide avec une etape specifique ?`
    },
    liveSession: {
      keywords: ['session live', 'direct', 'streaming', 'creer live'],
      response: `Pour creer une session live :
1. Allez dans "Mes Sessions" ou votre dashboard
2. Cliquez sur "Planifier une Session Live"
3. Configurez la date, l'heure et le cours associe
4. Testez votre camera et micro avant de commencer
5. Demarrez la session a l'heure prevue

Le systeme vous guidera pour la configuration technique.`
    },
    students: {
      keywords: ['etudiants', 'eleves', 'participants', 'inscrits'],
      response: `Vous pouvez gerer vos etudiants depuis :
- Votre dashboard enseignant, onglet "Etudiants"
- La page de chaque cours, section "Participants"

Vous y trouverez :
- La liste complete des inscrits
- Leur progression
- Les statistiques d'engagement`
    },
    analytics: {
      keywords: ['statistiques', 'analytics', 'performance', 'revenus'],
      response: `Vos statistiques sont disponibles sur votre dashboard :
- Nombre total d'etudiants
- Revenus mensuels
- Note moyenne de vos cours
- Temps de visionnage
- Taux de completion

Toutes les metriques sont mises a jour en temps reel.`
    }
  },
  general: {
    help: {
      keywords: ['aide', 'help', 'aidez-moi', 'besoin d\'aide'],
      response: `Je suis la pour vous aider ! Voici ce que je peux faire :

📚 Repondre a vos questions sur l'utilisation de la plateforme
🎓 Vous guider dans vos cours et formations
🎥 Vous aider avec les sessions live
⚙ Vous assister avec les parametres
💬 Vous mettre en contact avec le support

Posez-moi n'importe quelle question !`
    },
    navigation: {
      keywords: ['aller', 'naviguer', 'acceder', 'ou est'],
      response: `Je peux vous aider a naviguer sur la plateforme. Que cherchez-vous ?
- Catalogue de cours
- Mes cours
- Sessions live
- Profil
- Parametres
- Dashboard

Dites-moi simplement ou vous voulez aller.`
    },
    contact: {
      keywords: ['contact', 'support', 'email', 'aide humaine'],
      response: `Pour contacter notre equipe :
- Email : support@stream-educatif.com
- Formulaire de contact : Menu > Contact
- Chat en direct : Disponible 24/7 (vous y etes !)

Pour les urgences techniques, utilisez le formulaire de contact avec la mention "URGENT".`
    },
    settings: {
      keywords: ['parametres', 'reglages', 'configuration', 'compte'],
      response: `Vous pouvez gerer vos parametres depuis :
- Votre profil (icone utilisateur en haut a droite)
- Menu "Parametres"

Vous pouvez y modifier :
- Informations personnelles
- Preferences de notification
- Langue et fuseau horaire
- Confidentialite
- Securite (mot de passe, 2FA)`
    }
  }
};

// Reponses par defaut basees sur le role
const defaultResponses = {
  student: `Je n'ai pas bien compris votre question. En tant qu'etudiant, je peux vous aider avec :
- L'inscription aux cours
- Vos cours en cours
- Les sessions live
- Les certificats
- La navigation sur la plateforme

Pouvez-vous reformuler votre question ?`,
  teacher: `Je n'ai pas bien compris votre question. En tant qu'enseignant, je peux vous aider avec :
- La creation de cours
- Les sessions live
- La gestion des etudiants
- Les statistiques et revenus
- La configuration de votre profil

Pouvez-vous preciser votre demande ?`,
  admin: `En tant qu'administrateur, vous avez acces a toutes les fonctionnalites. Comment puis-je vous assister ?`,
  default: `Je n'ai pas bien compris. Pouvez-vous reformuler votre question ? Je peux vous aider avec la navigation, les cours, les sessions live, et bien plus encore.`
};

/**
 * Genere une reponse basee sur le message de l'utilisateur
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
        : ['Creer un cours', 'Mes statistiques', 'Planifier une session']
    };
  }

  // Au revoir
  if (/^(au revoir|bye|a bientot|merci)/.test(normalizedMessage)) {
    return {
      message: `Au revoir ! N'hesitez pas a revenir si vous avez d'autres questions. Bon apprentissage ! 🎓`
    };
  }

  // Recherche dans la base de connaissances specifique au role
  const roleKnowledge = knowledgeBase[context.userRole] || {};
  for (const [category, data] of Object.entries(roleKnowledge)) {
    if (data.keywords.some(keyword => normalizedMessage.includes(keyword))) {
      return {
        message: data.response,
        suggestions: getSuggestions(category, context.userRole)
      };
    }
  }

  // Recherche dans la base generale
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

  // Reponse par defaut
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
    createCourse: ['Creer un cours', 'Mes cours', 'Aide'],
    liveSession: ['Planifier', 'Mes sessions', 'Guide streaming'],
    students: ['Voir etudiants', 'Statistiques', 'Exporter donnees'],
    help: ['FAQ', 'Contact support', 'Tutoriels'],
    navigation: ['Retour accueil', 'Catalogue', 'Dashboard'],
    contact: ['Envoyer email', 'FAQ', 'Tutoriels']
  };

  return suggestions[category] || getDefaultSuggestions(role);
}

/**
 * Suggestions par defaut selon le role
 */
function getDefaultSuggestions(role: string): string[] {
  const defaults: Record<string, string[]> = {
    student: ['Mes cours', 'Sessions live', 'Catalogue', 'Aide'],
    teacher: ['Creer un cours', 'Mes sessions', 'Statistiques', 'Aide'],
    admin: ['Utilisateurs', 'Statistiques', 'Configuration', 'Aide']
  };

  return defaults[role] || ['Aide', 'Accueil'];
}

/**
 * Simule un delai de reponse pour un effet plus naturel
 */
export async function getChatbotResponseAsync(
  message: string,
  context: ChatContext
): Promise<ChatbotResponse> {
  const strictApiMode = isStrictApiModeEnabled();

  if (strictApiMode) {
    if (!canCallApiProvider()) {
      return buildStrictApiUnavailableResponse();
    }

    try {
      const history = getConversationHistory(context);
      const roleLabel = context.userRole;
      const pageLabel = context.currentPage || 'unknown';

      const response = await apiChatbotService.sendMessage({
        messages: [
          ...history,
          {
            role: 'user',
            content: `[role=${roleLabel};page=${pageLabel}] ${message}`,
          },
        ],
      });

      const content = response.content?.trim();
      if (!content) {
        return buildStrictApiErrorResponse();
      }

      return {
        message: content,
        source: 'api',
        provider: activeProvider,
      };
    } catch (error) {
      console.warn('Chatbot strict API mode: provider call failed.', error);
      return buildStrictApiErrorResponse();
    }
  }

  const fallbackResponse = generateChatbotResponse(message, context);

  // Keep deterministic navigation actions from local logic.
  if (fallbackResponse.action) {
    await waitLocalDelay();
    return {
      ...fallbackResponse,
      source: 'fallback',
      provider: 'local',
    };
  }

  if (!canCallApiProvider()) {
    await waitLocalDelay();
    return {
      ...fallbackResponse,
      source: 'fallback',
      provider: 'mock',
    };
  }

  try {
    const history = getConversationHistory(context);
    const roleLabel = context.userRole;
    const pageLabel = context.currentPage || 'unknown';

    const response = await apiChatbotService.sendMessage({
      messages: [
        ...history,
        {
          role: 'user',
          content: `[role=${roleLabel};page=${pageLabel}] ${message}`,
        },
      ],
    });

    const content = response.content?.trim();
    if (!content) {
      return {
        ...fallbackResponse,
        source: 'fallback',
        provider: 'local',
      };
    }

    return {
      message: content,
      suggestions: fallbackResponse.suggestions,
      source: 'api',
      provider: activeProvider,
    };
  } catch (error) {
    console.warn('Chatbot API fallback to local response:', error);
    await waitLocalDelay();
    return {
      ...fallbackResponse,
      source: 'fallback',
      provider: 'local',
    };
  }
}
