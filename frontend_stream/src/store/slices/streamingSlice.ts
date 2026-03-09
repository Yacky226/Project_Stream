import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StreamingSession, StreamingSettings, StreamingStats, HandRaise, Participant } from '../../types/streaming';
import { streamingApi } from '../api/streamingApi';

interface StreamingState {
  // Current session
  currentSession: StreamingSession | null;
  isStreaming: boolean;
  isViewing: boolean;
  
  // Media state
  isVideoOn: boolean;
  isAudioOn: boolean;
  isSharingScreen: boolean;
  volume: number;
  quality: 'HD' | 'FHD' | '4K' | 'auto';
  
  // Participants
  participants: Participant[];
  viewerCount: number;
  
  // Hand raises
  handRaises: HandRaise[];
  myHandRaise: HandRaise | null;
  
  // Stream settings
  settings: StreamingSettings;
  
  // Connection status
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  connectionQuality: 'excellent' | 'good' | 'poor';
  latency: number;
  bitrate: number;
  
  // Statistics
  stats: StreamingStats | null;
  sessionDuration: number;
  
  // Permissions
  canSpeak: boolean;
  speakingTimeRemaining: number;
  isMutedByHost: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Device management
  availableDevices: {
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  };
  selectedDevices: {
    camera: string;
    microphone: string;
    speaker: string;
  };
}

const initialState: StreamingState = {
  currentSession: null,
  isStreaming: false,
  isViewing: false,
  isVideoOn: true,
  isAudioOn: true,
  isSharingScreen: false,
  volume: 80,
  quality: 'auto',
  participants: [],
  viewerCount: 0,
  handRaises: [],
  myHandRaise: null,
  settings: {
    quality: 'HD',
    allowChat: true,
    allowQA: true,
    recordSession: false,
    maxViewers: 100,
    isPrivate: false,
  },
  connectionStatus: 'disconnected',
  connectionQuality: 'good',
  latency: 0,
  bitrate: 0,
  stats: null,
  sessionDuration: 0,
  canSpeak: false,
  speakingTimeRemaining: 0,
  isMutedByHost: false,
  isLoading: false,
  error: null,
  availableDevices: {
    cameras: [],
    microphones: [],
    speakers: [],
  },
  selectedDevices: {
    camera: '',
    microphone: '',
    speaker: '',
  },
};

// Async thunks
export const createStreamingSession = createAsyncThunk(
  'streaming/createSession',
  async (sessionData: {
    courseId: string;
    title: string;
    description: string;
    settings: StreamingSettings;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.createSession.initiate(sessionData).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create session');
    }
  }
);

export const joinStreamingSession = createAsyncThunk(
  'streaming/joinSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.joinSession.initiate({ sessionId }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join session');
    }
  }
);

export const leaveStreamingSession = createAsyncThunk(
  'streaming/leaveSession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      
      if (sessionId) {
        await streamingApi.endpoints.leaveSession.initiate({ sessionId }).unwrap();
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave session');
    }
  }
);

export const startStreaming = createAsyncThunk(
  'streaming/startStreaming',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      
      if (!sessionId) {
        throw new Error('No active session');
      }
      
      const response = await streamingApi.endpoints.startStream.initiate({ sessionId }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start streaming');
    }
  }
);

export const stopStreaming = createAsyncThunk(
  'streaming/stopStreaming',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      
      if (!sessionId) {
        throw new Error('No active session');
      }
      
      const response = await streamingApi.endpoints.stopStream.initiate({ sessionId }).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to stop streaming');
    }
  }
);

export const raiseHand = createAsyncThunk(
  'streaming/raiseHand',
  async (data: { reason?: string; category: string; isUrgent?: boolean }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      
      if (!sessionId) {
        throw new Error('No active session');
      }
      
      const response = await streamingApi.endpoints.raiseHand.initiate({
        sessionId,
        ...data,
      }).unwrap();
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to raise hand');
    }
  }
);

export const lowerHand = createAsyncThunk(
  'streaming/lowerHand',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      const handRaiseId = state.streaming.myHandRaise?.id;
      
      if (!sessionId || !handRaiseId) {
        throw new Error('No active hand raise');
      }
      
      await streamingApi.endpoints.lowerHand.initiate({
        sessionId,
        handRaiseId,
      }).unwrap();
      
      return handRaiseId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to lower hand');
    }
  }
);

export const approveHandRaise = createAsyncThunk(
  'streaming/approveHandRaise',
  async (data: { handRaiseId: string; speakingTime: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      
      if (!sessionId) {
        throw new Error('No active session');
      }
      
      const response = await streamingApi.endpoints.approveHandRaise.initiate({
        sessionId,
        ...data,
      }).unwrap();
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve hand raise');
    }
  }
);

export const updateStreamSettings = createAsyncThunk(
  'streaming/updateSettings',
  async (settings: Partial<StreamingSettings>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { streaming: StreamingState };
      const sessionId = state.streaming.currentSession?.id;
      
      if (!sessionId) {
        throw new Error('No active session');
      }
      
      const response = await streamingApi.endpoints.updateSettings.initiate({
        sessionId,
        settings,
      }).unwrap();
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update settings');
    }
  }
);

export const fetchAvailableDevices = createAsyncThunk(
  'streaming/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        cameras: devices.filter(device => device.kind === 'videoinput'),
        microphones: devices.filter(device => device.kind === 'audioinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput'),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch devices');
    }
  }
);

const streamingSlice = createSlice({
  name: 'streaming',
  initialState,
  reducers: {
    // Media controls
    toggleVideo: (state) => {
      state.isVideoOn = !state.isVideoOn;
    },
    toggleAudio: (state) => {
      state.isAudioOn = !state.isAudioOn;
    },
    toggleScreenShare: (state) => {
      state.isSharingScreen = !state.isSharingScreen;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(100, action.payload));
    },
    setQuality: (state, action: PayloadAction<'HD' | 'FHD' | '4K' | 'auto'>) => {
      state.quality = action.payload;
    },
    
    // Connection status
    setConnectionStatus: (state, action: PayloadAction<StreamingState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    setConnectionQuality: (state, action: PayloadAction<StreamingState['connectionQuality']>) => {
      state.connectionQuality = action.payload;
    },
    updateConnectionStats: (state, action: PayloadAction<{ latency: number; bitrate: number }>) => {
      state.latency = action.payload.latency;
      state.bitrate = action.payload.bitrate;
    },
    
    // Participants
    updateParticipants: (state, action: PayloadAction<Participant[]>) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action: PayloadAction<Participant>) => {
      const existingParticipant = state.participants.find(p => p.id === action.payload.id);
      if (!existingParticipant) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
    updateParticipant: (state, action: PayloadAction<{ id: string; updates: Partial<Participant> }>) => {
      const participant = state.participants.find(p => p.id === action.payload.id);
      if (participant) {
        Object.assign(participant, action.payload.updates);
      }
    },
    setViewerCount: (state, action: PayloadAction<number>) => {
      state.viewerCount = action.payload;
    },
    
    // Hand raises
    addHandRaise: (state, action: PayloadAction<HandRaise>) => {
      const existing = state.handRaises.find(hr => hr.id === action.payload.id);
      if (!existing) {
        state.handRaises.push(action.payload);
      }
    },
    removeHandRaise: (state, action: PayloadAction<string>) => {
      state.handRaises = state.handRaises.filter(hr => hr.id !== action.payload);
      if (state.myHandRaise?.id === action.payload) {
        state.myHandRaise = null;
      }
    },
    updateHandRaise: (state, action: PayloadAction<{ id: string; updates: Partial<HandRaise> }>) => {
      const handRaise = state.handRaises.find(hr => hr.id === action.payload.id);
      if (handRaise) {
        Object.assign(handRaise, action.payload.updates);
      }
      if (state.myHandRaise?.id === action.payload.id) {
        Object.assign(state.myHandRaise, action.payload.updates);
      }
    },
    
    // Speaking permissions
    setSpeakingPermission: (state, action: PayloadAction<{ canSpeak: boolean; timeRemaining?: number }>) => {
      state.canSpeak = action.payload.canSpeak;
      if (action.payload.timeRemaining !== undefined) {
        state.speakingTimeRemaining = action.payload.timeRemaining;
      }
    },
    updateSpeakingTime: (state, action: PayloadAction<number>) => {
      state.speakingTimeRemaining = Math.max(0, action.payload);
      if (state.speakingTimeRemaining <= 0) {
        state.canSpeak = false;
      }
    },
    setMutedByHost: (state, action: PayloadAction<boolean>) => {
      state.isMutedByHost = action.payload;
    },
    
    // Session management
    updateSessionDuration: (state, action: PayloadAction<number>) => {
      state.sessionDuration = action.payload;
    },
    updateStats: (state, action: PayloadAction<StreamingStats>) => {
      state.stats = action.payload;
    },
    
    // Device management
    selectDevice: (state, action: PayloadAction<{ type: 'camera' | 'microphone' | 'speaker'; deviceId: string }>) => {
      state.selectedDevices[action.payload.type] = action.payload.deviceId;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    // Reset state
    resetStreamingState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Create session
    builder
      .addCase(createStreamingSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStreamingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        state.connectionStatus = 'connected';
        state.error = null;
      })
      .addCase(createStreamingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.connectionStatus = 'error';
      });

    // Join session
    builder
      .addCase(joinStreamingSession.pending, (state) => {
        state.isLoading = true;
        state.connectionStatus = 'connecting';
        state.error = null;
      })
      .addCase(joinStreamingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.session;
        state.participants = action.payload.participants;
        state.handRaises = action.payload.handRaises;
        state.isViewing = true;
        state.connectionStatus = 'connected';
        state.error = null;
      })
      .addCase(joinStreamingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.connectionStatus = 'error';
      });

    // Leave session
    builder
      .addCase(leaveStreamingSession.fulfilled, (state) => {
        state.currentSession = null;
        state.isViewing = false;
        state.isStreaming = false;
        state.participants = [];
        state.handRaises = [];
        state.myHandRaise = null;
        state.connectionStatus = 'disconnected';
        state.canSpeak = false;
        state.speakingTimeRemaining = 0;
      });

    // Start streaming
    builder
      .addCase(startStreaming.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startStreaming.fulfilled, (state) => {
        state.isLoading = false;
        state.isStreaming = true;
        state.error = null;
      })
      .addCase(startStreaming.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Stop streaming
    builder
      .addCase(stopStreaming.fulfilled, (state) => {
        state.isStreaming = false;
      });

    // Raise hand
    builder
      .addCase(raiseHand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(raiseHand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myHandRaise = action.payload;
        if (!state.handRaises.find(hr => hr.id === action.payload.id)) {
          state.handRaises.push(action.payload);
        }
        state.error = null;
      })
      .addCase(raiseHand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Lower hand
    builder
      .addCase(lowerHand.fulfilled, (state, action) => {
        state.myHandRaise = null;
        state.handRaises = state.handRaises.filter(hr => hr.id !== action.payload);
      });

    // Approve hand raise
    builder
      .addCase(approveHandRaise.fulfilled, (state, action) => {
        const handRaiseId = action.payload.handRaiseId;
        state.handRaises = state.handRaises.filter(hr => hr.id !== handRaiseId);
        
        // Update participant speaking status
        const participant = state.participants.find(p => p.id === action.payload.userId);
        if (participant) {
          participant.canSpeak = true;
          participant.speakingTimeRemaining = action.payload.speakingTime;
        }
      });

    // Update settings
    builder
      .addCase(updateStreamSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      });

    // Fetch devices
    builder
      .addCase(fetchAvailableDevices.fulfilled, (state, action) => {
        state.availableDevices = action.payload;
      });
  },
});

export const {
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  setVolume,
  setQuality,
  setConnectionStatus,
  setConnectionQuality,
  updateConnectionStats,
  updateParticipants,
  addParticipant,
  removeParticipant,
  updateParticipant,
  setViewerCount,
  addHandRaise,
  removeHandRaise,
  updateHandRaise,
  setSpeakingPermission,
  updateSpeakingTime,
  setMutedByHost,
  updateSessionDuration,
  updateStats,
  selectDevice,
  clearError,
  setError,
  resetStreamingState,
} = streamingSlice.actions;

export default streamingSlice.reducer;