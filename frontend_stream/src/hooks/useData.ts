/**
 * Hook pour accéder aux données (mock ou réelles)
 * Facilite le basculement entre les modes de données
 */

import { useCallback } from 'react';
import { configUtils } from '../lib/config';
import { mockDataService } from '../lib/mockData';
import { apiService } from '../lib/api';

export function useData() {
  const shouldUseMockData = configUtils.shouldUseMockData();

  // Users
  const getUsers = useCallback(async () => {
    if (shouldUseMockData) {
      return mockDataService.getUsers();
    } else {
      // TODO: Implémenter avec l'API réelle
      return [];
    }
  }, [shouldUseMockData]);

  const getUserById = useCallback(async (id: string) => {
    if (shouldUseMockData) {
      return mockDataService.getUserById(id);
    } else {
      // TODO: Implémenter avec l'API réelle
      return null;
    }
  }, [shouldUseMockData]);

  // Courses
  const getCourses = useCallback(async (filters?: any) => {
    if (shouldUseMockData) {
      return mockDataService.getCourses(filters);
    } else {
      // TODO: Implémenter avec l'API réelle
      return [];
    }
  }, [shouldUseMockData]);

  const getCourseById = useCallback(async (id: string) => {
    if (shouldUseMockData) {
      return mockDataService.getCourseById(id);
    } else {
      // TODO: Implémenter avec l'API réelle
      return null;
    }
  }, [shouldUseMockData]);

  const getEnrolledCourses = useCallback(async (userId: string) => {
    if (shouldUseMockData) {
      return mockDataService.getEnrolledCourses(userId);
    } else {
      // TODO: Implémenter avec l'API réelle
      return [];
    }
  }, [shouldUseMockData]);

  // Live Sessions
  const getLiveSessions = useCallback(async () => {
    if (shouldUseMockData) {
      return mockDataService.getLiveSessions();
    } else {
      const response = await apiService.getActiveLiveSessions();
      return response.success ? response.data : [];
    }
  }, [shouldUseMockData]);

  const getLiveSessionById = useCallback(async (id: string) => {
    if (shouldUseMockData) {
      return mockDataService.getLiveSessionById(id);
    } else {
      const response = await apiService.getLiveSession(id);
      return response.success ? response.data : null;
    }
  }, [shouldUseMockData]);

  const getActiveLiveSessions = useCallback(async () => {
    if (shouldUseMockData) {
      return mockDataService.getActiveLiveSessions();
    } else {
      const response = await apiService.getActiveLiveSessions();
      return response.success ? response.data : [];
    }
  }, [shouldUseMockData]);

  // Chat
  const getChatMessages = useCallback(async (sessionId: string) => {
    if (shouldUseMockData) {
      return mockDataService.getChatMessages(sessionId);
    } else {
      const response = await apiService.getChatMessages(sessionId);
      return response.success ? response.data : [];
    }
  }, [shouldUseMockData]);

  const sendChatMessage = useCallback(async (sessionId: string, userId: string, message: string, isQuestion: boolean = false) => {
    if (shouldUseMockData) {
      return mockDataService.sendChatMessage(sessionId, userId, message, isQuestion);
    } else {
      const response = await apiService.sendChatMessage(sessionId, message, isQuestion);
      return response.success ? response.data : null;
    }
  }, [shouldUseMockData]);

  // Notifications
  const getNotifications = useCallback(async (userId: string) => {
    if (shouldUseMockData) {
      return mockDataService.getNotifications(userId);
    } else {
      // TODO: Implémenter avec l'API réelle
      return [];
    }
  }, [shouldUseMockData]);

  // Statistics
  const getStats = useCallback(async () => {
    if (shouldUseMockData) {
      return mockDataService.getStats();
    } else {
      // TODO: Implémenter avec l'API réelle
      return {
        totalUsers: 0,
        totalCourses: 0,
        activeLiveSessions: 0,
        totalMessages: 0
      };
    }
  }, [shouldUseMockData]);

  // Mode information
  const getDataMode = useCallback(() => {
    return {
      useMockData: shouldUseMockData,
      backendEnabled: configUtils.isBackendEnabled(),
      environment: configUtils.getEnvironment()
    };
  }, [shouldUseMockData]);

  return {
    // Mode info
    dataMode: getDataMode(),
    
    // Users
    getUsers,
    getUserById,
    
    // Courses
    getCourses,
    getCourseById,
    getEnrolledCourses,
    
    // Live Sessions
    getLiveSessions,
    getLiveSessionById,
    getActiveLiveSessions,
    
    // Chat
    getChatMessages,
    sendChatMessage,
    
    // Notifications
    getNotifications,
    
    // Statistics
    getStats,
  };
}

// Hook spécialisé pour les services de streaming
export function useStreamingData() {
  const shouldUseMockData = configUtils.shouldUseMockData();

  const createSession = useCallback(async (sessionData: any) => {
    if (shouldUseMockData) {
      // Simuler la création d'une session
      const session = {
        id: `session-${Date.now()}`,
        ...sessionData,
        startTime: new Date().toISOString(),
        isLive: false,
        viewerCount: 0,
      };
      return session;
    } else {
      const response = await apiService.createLiveSession(sessionData);
      return response.success ? response.data : null;
    }
  }, [shouldUseMockData]);

  const startSession = useCallback(async (sessionId: string, webrtcOffer?: RTCSessionDescriptionInit) => {
    if (shouldUseMockData) {
      // Simuler le démarrage d'une session
      return {
        streamUrl: `mock://stream/${sessionId}`,
        answer: null
      };
    } else {
      const response = await apiService.startLiveSession(sessionId, webrtcOffer);
      return response.success ? response.data : null;
    }
  }, [shouldUseMockData]);

  const stopSession = useCallback(async (sessionId: string) => {
    if (shouldUseMockData) {
      // Simuler l'arrêt d'une session
      return true;
    } else {
      const response = await apiService.stopLiveSession(sessionId);
      return response.success;
    }
  }, [shouldUseMockData]);

  const joinSession = useCallback(async (sessionId: string, webrtcOffer?: RTCSessionDescriptionInit) => {
    if (shouldUseMockData) {
      // Simuler la jointure d'une session
      return {
        streamUrl: `mock://stream/${sessionId}`,
        answer: null
      };
    } else {
      const response = await apiService.joinLiveSession(sessionId, webrtcOffer);
      return response.success ? response.data : null;
    }
  }, [shouldUseMockData]);

  return {
    createSession,
    startSession,
    stopSession,
    joinSession,
  };
}

// Hook pour la gestion du développement
export function useDevData() {
  return {
    // Permet de basculer entre les modes de données
    toggleDataMode: async () => {
      if (configUtils.isDevelopment()) {
        if (configUtils.isBackendEnabled()) {
          configUtils.disableBackend();
          console.log('🔄 Switched to mock data mode');
        } else {
          try {
            configUtils.enableBackend();
            console.log('🔄 Switched to backend data mode');
          } catch (error) {
            console.error('Failed to enable backend:', error);
          }
        }
        
        // Recharger la page pour appliquer les changements
        window.location.reload();
      }
    },

    // Informations sur le mode actuel
    getCurrentMode: () => ({
      useMockData: configUtils.shouldUseMockData(),
      backendEnabled: configUtils.isBackendEnabled(),
      environment: configUtils.getEnvironment(),
    }),

    // Helpers pour le développement
    logCurrentState: () => {
      if (configUtils.isDevelopment()) {
        console.group('🔍 Data Mode Status');
        console.table({
          'Mock Data': configUtils.shouldUseMockData(),
          'Backend Enabled': configUtils.isBackendEnabled(),
          'Environment': configUtils.getEnvironment(),
        });
        console.groupEnd();
      }
    },
  };
}