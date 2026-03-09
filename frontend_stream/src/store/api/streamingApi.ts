import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StreamingSession, StreamingSettings, Participant, HandRaise } from '../../types/streaming';
import { ChatMessage, ChatSettings } from '../../types/chat';

export const streamingApi = createApi({
  reducerPath: 'streamingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'production' 
      ? '/api/v1' 
      : 'http://localhost:8080/api/v1',
    
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state?.auth?.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('content-type', 'application/json');
      headers.set('accept', 'application/json');
      
      return headers;
    },
  }),
  
  tagTypes: ['StreamingSession', 'ChatMessage'],
  endpoints: (builder) => ({
    // Create streaming session
    createSession: builder.mutation<StreamingSession, {
      courseId: string;
      title: string;
      description: string;
      settings: StreamingSettings;
    }>({
      query: (data) => ({
        url: '/streaming/sessions',
        method: 'POST',
        body: data,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mockSession: StreamingSession = {
            id: `session-${Date.now()}`,
            courseId: data.courseId,
            title: data.title,
            description: data.description,
            status: 'pending',
            viewerCount: 0,
            maxViewers: data.settings.maxViewers,
            settings: data.settings,
            hostId: 'current-user',
            hostName: 'Vous',
            isPrivate: data.settings.isPrivate,
          };
          
          return { data: mockSession };
        }
        
        return baseQuery({
          url: '/streaming/sessions',
          method: 'POST',
          body: data,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['StreamingSession'],
    }),
    
    // Join streaming session
    joinSession: builder.mutation<{
      session: StreamingSession;
      participants: Participant[];
      handRaises: HandRaise[];
    }, { sessionId: string }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/join`,
        method: 'POST',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockSession: StreamingSession = {
            id: data.sessionId,
            courseId: 'react-hooks',
            title: 'React Hooks Avancés - Session Live',
            description: 'Session en direct pour approfondir les hooks React',
            status: 'live',
            viewerCount: 47,
            maxViewers: 100,
            settings: {
              quality: 'HD',
              allowChat: true,
              allowQA: true,
              allowHandRaise: true,
              recordSession: true,
              maxViewers: 100,
              isPrivate: false,
              chatModeration: false,
              slowMode: 0,
              chatMemberOnly: false,
              allowScreenShare: true,
              allowParticipantVideo: false,
              allowParticipantAudio: false,
              handRaiseTimeout: 5,
              speakingTimeLimit: 120,
            },
            hostId: 'instructor1',
            hostName: 'Sarah Martin',
            isPrivate: false,
          };
          
          const mockParticipants: Participant[] = [
            {
              id: 'host',
              userId: 'instructor1',
              username: 'Sarah Martin',
              role: 'host',
              isVideoOn: true,
              isAudioOn: true,
              isSharingScreen: false,
              canSpeak: true,
              canShareScreen: true,
              canModerateChat: true,
              isMutedByHost: false,
              isBannedFromChat: false,
              connectionStatus: 'connected',
              joinTime: new Date(Date.now() - 900000),
              lastSeen: new Date(),
              hasHandRaised: false,
              speakingTimeRemaining: 0,
              totalSpeakingTime: 0,
            },
          ];
          
          const mockHandRaises: HandRaise[] = [
            {
              id: '1',
              userId: 'student1',
              username: 'Marie Dupont',
              timestamp: new Date(Date.now() - 120000),
              reason: 'Question sur useEffect',
              category: 'question',
              priority: 'medium',
              status: 'pending',
            },
          ];
          
          return {
            data: {
              session: mockSession,
              participants: mockParticipants,
              handRaises: mockHandRaises,
            }
          };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/join`,
          method: 'POST',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['StreamingSession'],
    }),
    
    // Leave streaming session
    leaveSession: builder.mutation<void, { sessionId: string }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/leave`,
        method: 'POST',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/leave`,
          method: 'POST',
        }, api, extraOptions);
      },
    }),
    
    // Start streaming
    startStream: builder.mutation<void, { sessionId: string }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/start`,
        method: 'POST',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/start`,
          method: 'POST',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['StreamingSession'],
    }),
    
    // Stop streaming
    stopStream: builder.mutation<void, { sessionId: string }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/stop`,
        method: 'POST',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/stop`,
          method: 'POST',
        }, api, extraOptions);
      },
      
      invalidatesTags: ['StreamingSession'],
    }),
    
    // Raise hand
    raiseHand: builder.mutation<HandRaise, {
      sessionId: string;
      reason?: string;
      category: string;
      isUrgent?: boolean;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/hand-raise`,
        method: 'POST',
        body: {
          reason: data.reason,
          category: data.category,
          isUrgent: data.isUrgent,
        },
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const handRaise: HandRaise = {
            id: `hand-${Date.now()}`,
            userId: 'current-user',
            username: 'Vous',
            timestamp: new Date(),
            reason: data.reason,
            category: data.category as any,
            priority: data.isUrgent ? 'high' : 'medium',
            status: 'pending',
            isUrgent: data.isUrgent,
          };
          
          return { data: handRaise };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/hand-raise`,
          method: 'POST',
          body: {
            reason: data.reason,
            category: data.category,
            isUrgent: data.isUrgent,
          },
        }, api, extraOptions);
      },
    }),
    
    // Lower hand
    lowerHand: builder.mutation<void, {
      sessionId: string;
      handRaiseId: string;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/hand-raise/${data.handRaiseId}`,
        method: 'DELETE',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/hand-raise/${data.handRaiseId}`,
          method: 'DELETE',
        }, api, extraOptions);
      },
    }),
    
    // Approve hand raise
    approveHandRaise: builder.mutation<{
      handRaiseId: string;
      userId: string;
      speakingTime: number;
    }, {
      sessionId: string;
      handRaiseId: string;
      speakingTime: number;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/hand-raise/${data.handRaiseId}/approve`,
        method: 'POST',
        body: { speakingTime: data.speakingTime },
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          return {
            data: {
              handRaiseId: data.handRaiseId,
              userId: 'student-user',
              speakingTime: data.speakingTime,
            }
          };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/hand-raise/${data.handRaiseId}/approve`,
          method: 'POST',
          body: { speakingTime: data.speakingTime },
        }, api, extraOptions);
      },
    }),
    
    // Send chat message
    sendChatMessage: builder.mutation<void, {
      sessionId: string;
      message: string;
      type: 'message' | 'question' | 'announcement';
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat`,
        method: 'POST',
        body: {
          message: data.message,
          type: data.type,
        },
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat`,
          method: 'POST',
          body: {
            message: data.message,
            type: data.type,
          },
        }, api, extraOptions);
      },
      
      invalidatesTags: ['ChatMessage'],
    }),
    
    // React to message
    reactToMessage: builder.mutation<void, {
      sessionId: string;
      messageId: string;
      reaction: 'like' | 'heart' | 'laugh' | 'angry' | 'sad';
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/react`,
        method: 'POST',
        body: { reaction: data.reaction },
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return { data: undefined };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/react`,
          method: 'POST',
          body: { reaction: data.reaction },
        }, api, extraOptions);
      },
    }),
    
    // Moderate message
    moderateMessage: builder.mutation<{
      messageId: string;
      action: 'approve' | 'reject' | 'delete' | 'flag';
    }, {
      sessionId: string;
      messageId: string;
      action: 'approve' | 'reject' | 'delete' | 'flag';
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/moderate`,
        method: 'POST',
        body: { action: data.action },
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          return {
            data: {
              messageId: data.messageId,
              action: data.action,
            }
          };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/moderate`,
          method: 'POST',
          body: { action: data.action },
        }, api, extraOptions);
      },
      
      invalidatesTags: ['ChatMessage'],
    }),
    
    // Pin message
    pinMessage: builder.mutation<{ messageId: string }, {
      sessionId: string;
      messageId: string;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/pin`,
        method: 'POST',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return { data: { messageId: data.messageId } };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/pin`,
          method: 'POST',
        }, api, extraOptions);
      },
    }),
    
    // Unpin message
    unpinMessage: builder.mutation<{ messageId: string }, {
      sessionId: string;
      messageId: string;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/pin`,
        method: 'DELETE',
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return { data: { messageId: data.messageId } };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat/${data.messageId}/pin`,
          method: 'DELETE',
        }, api, extraOptions);
      },
    }),
    
    // Update settings
    updateSettings: builder.mutation<Partial<StreamingSettings>, {
      sessionId: string;
      settings: Partial<StreamingSettings>;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/settings`,
        method: 'PUT',
        body: data.settings,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return { data: data.settings };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/settings`,
          method: 'PUT',
          body: data.settings,
        }, api, extraOptions);
      },
      
      invalidatesTags: ['StreamingSession'],
    }),
    
    // Update chat settings
    updateChatSettings: builder.mutation<Partial<ChatSettings>, {
      sessionId: string;
      settings: Partial<ChatSettings>;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat/settings`,
        method: 'PUT',
        body: data.settings,
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          return { data: data.settings };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat/settings`,
          method: 'PUT',
          body: data.settings,
        }, api, extraOptions);
      },
    }),
    
    // Get chat history
    getChatHistory: builder.query<{
      messages: ChatMessage[];
      hasMore: boolean;
    }, {
      sessionId: string;
      limit?: number;
      before?: string;
    }>({
      query: (data) => ({
        url: `/streaming/sessions/${data.sessionId}/chat/history`,
        params: {
          limit: data.limit,
          before: data.before,
        },
      }),
      
      queryFn: async (data, api, extraOptions, baseQuery) => {
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          return {
            data: {
              messages: [],
              hasMore: false,
            }
          };
        }
        
        return baseQuery({
          url: `/streaming/sessions/${data.sessionId}/chat/history`,
          params: {
            limit: data.limit,
            before: data.before,
          },
        }, api, extraOptions);
      },
      
      providesTags: ['ChatMessage'],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useJoinSessionMutation,
  useLeaveSessionMutation,
  useStartStreamMutation,
  useStopStreamMutation,
  useRaiseHandMutation,
  useLowerHandMutation,
  useApproveHandRaiseMutation,
  useSendChatMessageMutation,
  useReactToMessageMutation,
  useModeratMessageMutation,
  usePinMessageMutation,
  useUnpinMessageMutation,
  useUpdateSettingsMutation,
  useUpdateChatSettingsMutation,
  useGetChatHistoryQuery,
} = streamingApi;