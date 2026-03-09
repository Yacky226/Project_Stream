/**
 * Streaming Service Provider
 * Provides streaming service context and initialization
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { streamingService, useStreaming, StreamingSession } from '../../lib/streaming';
import { useIntegration } from '../../lib/integration';
import { ConnectionStatus } from './ConnectionStatus';
import { DevelopmentModeInfo } from './DevelopmentModeInfo';

interface StreamingContextType {
  isInitialized: boolean;
  currentSession: StreamingSession | null;
  streamingStatus: {
    isStreaming: boolean;
    isViewing: boolean;
    sessionId: string | null;
    status: string;
  };
  serviceStatus: {
    integration: any;
    streaming: any;
  } | null;
  error: string | null;
  // Service methods
  createSession: (courseId: string, title: string, description: string, settings: any) => Promise<StreamingSession>;
  startStreaming: (sessionId: string, constraints?: MediaStreamConstraints) => Promise<void>;
  stopStreaming: () => Promise<void>;
  joinAsViewer: (sessionId: string) => Promise<MediaStream>;
  leaveSession: () => Promise<void>;
  toggleVideo: () => boolean;
  toggleAudio: () => boolean;
  shareScreen: () => Promise<MediaStream>;
  sendChatMessage: (message: string, isQuestion?: boolean) => Promise<void>;
  refreshServiceStatus: () => Promise<void>;
}

const StreamingContext = createContext<StreamingContextType | null>(null);

interface StreamingServiceProviderProps {
  children: ReactNode;
}

export function StreamingServiceProvider({ children }: StreamingServiceProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSession, setCurrentSession] = useState<StreamingSession | null>(null);
  const [streamingStatus, setStreamingStatus] = useState({
    isStreaming: false,
    isViewing: false,
    sessionId: null as string | null,
    status: 'idle'
  });
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const streaming = useStreaming();
  const integration = useIntegration();
  
  // Initialize services
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing streaming services...');
        
        // Initialize integration service
        await integration.initialize();
        
        // Initialize streaming service
        await streaming.initialize();
        
        // Setup event handlers
        streamingService.on('onStatusChange', (status) => {
          setStreamingStatus(prev => ({ ...prev, status }));
        });
        
        streamingService.on('onViewerCountChange', (count) => {
          console.log('Viewer count updated:', count);
        });
        
        streamingService.on('onError', (error) => {
          setError(error.message);
          console.error('Streaming error:', error);
        });
        
        streamingService.on('onChatMessage', (message) => {
          console.log('Chat message received:', message);
        });
        
        // Get initial service status
        const status = await streaming.getServiceStatus();
        setServiceStatus(status);
        
        setIsInitialized(true);
        console.log('Streaming services initialized successfully');
        
      } catch (error) {
        console.error('Failed to initialize streaming services:', error);
        setError(error instanceof Error ? error.message : 'Initialization failed');
        setIsInitialized(true); // Allow fallback mode
      }
    };
    
    initialize();
  }, []);
  
  // Update streaming status periodically
  useEffect(() => {
    if (!isInitialized) return;
    
    const updateStatus = () => {
      const status = streaming.getStreamingStatus();
      setStreamingStatus(status);
      
      const session = streaming.getCurrentSession();
      setCurrentSession(session);
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    
    return () => clearInterval(interval);
  }, [isInitialized]);
  
  const refreshServiceStatus = async () => {
    try {
      const status = await streaming.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Error refreshing service status:', error);
    }
  };
  
  const contextValue: StreamingContextType = {
    isInitialized,
    currentSession,
    streamingStatus,
    serviceStatus,
    error,
    createSession: async (courseId, title, description, settings) => {
      try {
        setError(null);
        const session = await streaming.createSession(courseId, title, description, settings);
        setCurrentSession(session);
        return session;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
        setError(errorMessage);
        throw error;
      }
    },
    startStreaming: async (sessionId, constraints) => {
      try {
        setError(null);
        await streaming.startStreaming(sessionId, constraints);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start streaming';
        setError(errorMessage);
        throw error;
      }
    },
    stopStreaming: async () => {
      try {
        setError(null);
        await streaming.stopStreaming();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stop streaming';
        setError(errorMessage);
        throw error;
      }
    },
    joinAsViewer: async (sessionId) => {
      try {
        setError(null);
        return await streaming.joinAsViewer(sessionId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
        setError(errorMessage);
        throw error;
      }
    },
    leaveSession: async () => {
      try {
        setError(null);
        await streaming.leaveSession();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to leave session';
        setError(errorMessage);
        throw error;
      }
    },
    toggleVideo: () => {
      try {
        setError(null);
        return streaming.toggleVideo();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to toggle video';
        setError(errorMessage);
        return false;
      }
    },
    toggleAudio: () => {
      try {
        setError(null);
        return streaming.toggleAudio();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to toggle audio';
        setError(errorMessage);
        return false;
      }
    },
    shareScreen: async () => {
      try {
        setError(null);
        return await streaming.shareScreen();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to share screen';
        setError(errorMessage);
        throw error;
      }
    },
    sendChatMessage: async (message, isQuestion) => {
      try {
        setError(null);
        await streaming.sendChatMessage(message, isQuestion);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        setError(errorMessage);
        throw error;
      }
    },
    refreshServiceStatus
  };
  
  return (
    <StreamingContext.Provider value={contextValue}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreamingContext(): StreamingContextType {
  const context = useContext(StreamingContext);
  if (!context) {
    throw new Error('useStreamingContext must be used within a StreamingServiceProvider');
  }
  return context;
}

// Debug component for development
export function StreamingDebugPanel() {
  const {
    isInitialized,
    streamingStatus,
    serviceStatus,
    error,
    refreshServiceStatus
  } = useStreamingContext();
  
  if (!isInitialized) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Initializing streaming services...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <DevelopmentModeInfo />
      <ConnectionStatus />
      
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Streaming Service Status</h3>
          <button
            onClick={refreshServiceStatus}
            className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            Error: {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Streaming Status</h4>
            <ul className="space-y-1">
              <li>Is Streaming: <span className={streamingStatus.isStreaming ? 'text-green-600' : 'text-gray-600'}>{streamingStatus.isStreaming ? 'Yes' : 'No'}</span></li>
              <li>Is Viewing: <span className={streamingStatus.isViewing ? 'text-green-600' : 'text-gray-600'}>{streamingStatus.isViewing ? 'Yes' : 'No'}</span></li>
              <li>Status: <span className="font-mono">{streamingStatus.status}</span></li>
              <li>Session ID: <span className="font-mono">{streamingStatus.sessionId || 'None'}</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Backend Status</h4>
            {serviceStatus ? (
              <ul className="space-y-1">
                <li>Spring Boot: <span className={serviceStatus.integration?.springBoot?.available ? 'text-green-600' : 'text-red-600'}>{serviceStatus.integration?.springBoot?.available ? 'Available' : 'Unavailable'}</span></li>
                <li>Janus Gateway: <span className={serviceStatus.integration?.janus?.available ? 'text-green-600' : 'text-red-600'}>{serviceStatus.integration?.janus?.available ? 'Available' : 'Unavailable'}</span></li>
                <li>Fallback Mode: <span className={serviceStatus.integration?.fallbackMode ? 'text-yellow-600' : 'text-green-600'}>{serviceStatus.integration?.fallbackMode ? 'Yes' : 'No'}</span></li>
              </ul>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>
        </div>
        
        {serviceStatus?.integration && (
          <div className="text-xs text-muted-foreground">
            <p>Spring Boot URL: {serviceStatus.integration.springBoot?.url}</p>
            <p>Janus URL: {serviceStatus.integration.janus?.url}</p>
          </div>
        )}
      </div>
    </div>
  );
}