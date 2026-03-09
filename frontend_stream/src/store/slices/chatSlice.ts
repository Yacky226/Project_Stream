import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatSettings, ChatReaction } from '../../types/chat';
import { streamingApi } from '../api/streamingApi';

interface ChatState {
  messages: ChatMessage[];
  moderationQueue: ChatMessage[];
  pinnedMessages: ChatMessage[];
  settings: ChatSettings;
  isEnabled: boolean;
  isMuted: boolean;
  
  // Filters and search
  searchQuery: string;
  selectedFilter: 'all' | 'questions' | 'announcements' | 'flagged' | 'moderation';
  
  // User state
  canSendMessages: boolean;
  lastMessageTime: number | null;
  slowModeRemaining: number;
  
  // Statistics
  totalMessages: number;
  questionsCount: number;
  flaggedCount: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  isScrolledToBottom: boolean;
  
  // Typing indicators
  typingUsers: string[];
}

const initialState: ChatState = {
  messages: [],
  moderationQueue: [],
  pinnedMessages: [],
  settings: {
    enableChat: true,
    allowStudentMessages: true,
    allowQuestions: true,
    requireModeration: false,
    allowEmojis: true,
    slowMode: 0,
    maxMessageLength: 500,
    bannedWords: [],
    allowReactions: true,
    allowReplies: true,
    autoDeleteSpam: false,
  },
  isEnabled: true,
  isMuted: false,
  searchQuery: '',
  selectedFilter: 'all',
  canSendMessages: true,
  lastMessageTime: null,
  slowModeRemaining: 0,
  totalMessages: 0,
  questionsCount: 0,
  flaggedCount: 0,
  isLoading: false,
  error: null,
  unreadCount: 0,
  isScrolledToBottom: true,
  typingUsers: [],
};

// Async thunks
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data: {
    message: string;
    type: 'message' | 'question' | 'announcement';
    sessionId: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState };
      
      // Check message length
      if (data.message.length > state.chat.settings.maxMessageLength) {
        throw new Error('Message too long');
      }
      
      // Check banned words
      const hasBannedWord = state.chat.settings.bannedWords.some(word =>
        data.message.toLowerCase().includes(word.toLowerCase())
      );
      
      if (hasBannedWord) {
        throw new Error('Message contains banned words');
      }
      
      const response = await streamingApi.endpoints.sendChatMessage.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const reactToMessage = createAsyncThunk(
  'chat/reactToMessage',
  async (data: {
    messageId: string;
    reaction: 'like' | 'heart' | 'laugh' | 'angry' | 'sad';
    sessionId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.reactToMessage.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to react to message');
    }
  }
);

export const moderateMessage = createAsyncThunk(
  'chat/moderateMessage',
  async (data: {
    messageId: string;
    action: 'approve' | 'reject' | 'delete' | 'flag';
    sessionId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.moderateMessage.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to moderate message');
    }
  }
);

export const pinMessage = createAsyncThunk(
  'chat/pinMessage',
  async (data: {
    messageId: string;
    sessionId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.pinMessage.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to pin message');
    }
  }
);

export const unpinMessage = createAsyncThunk(
  'chat/unpinMessage',
  async (data: {
    messageId: string;
    sessionId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.unpinMessage.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unpin message');
    }
  }
);

export const updateChatSettings = createAsyncThunk(
  'chat/updateSettings',
  async (data: {
    settings: Partial<ChatSettings>;
    sessionId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.updateChatSettings.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update chat settings');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (data: {
    sessionId: string;
    limit?: number;
    before?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await streamingApi.endpoints.getChatHistory.initiate(data).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chat history');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Message management
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.settings.requireModeration && !action.payload.isFromTeacher) {
        state.moderationQueue.push(action.payload);
      } else {
        state.messages.push(action.payload);
        state.totalMessages++;
        if (action.payload.isQuestion) {
          state.questionsCount++;
        }
        if (!state.isScrolledToBottom) {
          state.unreadCount++;
        }
      }
    },
    
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
      state.moderationQueue = state.moderationQueue.filter(msg => msg.id !== action.payload);
      state.pinnedMessages = state.pinnedMessages.filter(msg => msg.id !== action.payload);
    },
    
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<ChatMessage> }>) => {
      const { id, updates } = action.payload;
      
      // Update in messages
      const messageIndex = state.messages.findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      }
      
      // Update in moderation queue
      const queueIndex = state.moderationQueue.findIndex(msg => msg.id === id);
      if (queueIndex !== -1) {
        state.moderationQueue[queueIndex] = { ...state.moderationQueue[queueIndex], ...updates };
      }
      
      // Update in pinned messages
      const pinnedIndex = state.pinnedMessages.findIndex(msg => msg.id === id);
      if (pinnedIndex !== -1) {
        state.pinnedMessages[pinnedIndex] = { ...state.pinnedMessages[pinnedIndex], ...updates };
      }
    },
    
    // Reactions
    addReaction: (state, action: PayloadAction<{
      messageId: string;
      reaction: ChatReaction;
      userId: string;
    }>) => {
      const { messageId, reaction, userId } = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      
      if (message) {
        if (!message.reactions) {
          message.reactions = {};
        }
        
        if (!message.reactions[reaction.type]) {
          message.reactions[reaction.type] = [];
        }
        
        // Remove any existing reaction from this user
        Object.keys(message.reactions).forEach(reactionType => {
          message.reactions![reactionType] = message.reactions![reactionType].filter(
            r => r.userId !== userId
          );
        });
        
        // Add new reaction
        message.reactions[reaction.type].push(reaction);
      }
    },
    
    removeReaction: (state, action: PayloadAction<{
      messageId: string;
      reactionType: string;
      userId: string;
    }>) => {
      const { messageId, reactionType, userId } = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      
      if (message && message.reactions && message.reactions[reactionType]) {
        message.reactions[reactionType] = message.reactions[reactionType].filter(
          r => r.userId !== userId
        );
      }
    },
    
    // Pinning
    setPinned: (state, action: PayloadAction<{ messageId: string; isPinned: boolean }>) => {
      const { messageId, isPinned } = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      
      if (message) {
        message.isPinned = isPinned;
        
        if (isPinned) {
          if (!state.pinnedMessages.find(msg => msg.id === messageId)) {
            state.pinnedMessages.push(message);
          }
        } else {
          state.pinnedMessages = state.pinnedMessages.filter(msg => msg.id !== messageId);
        }
      }
    },
    
    // Moderation
    approveMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const messageIndex = state.moderationQueue.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        const message = state.moderationQueue[messageIndex];
        state.messages.push(message);
        state.moderationQueue.splice(messageIndex, 1);
        state.totalMessages++;
        if (message.isQuestion) {
          state.questionsCount++;
        }
      }
    },
    
    rejectMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      state.moderationQueue = state.moderationQueue.filter(msg => msg.id !== messageId);
    },
    
    flagMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      
      if (message) {
        message.isFlagged = !message.isFlagged;
        if (message.isFlagged) {
          state.flaggedCount++;
        } else {
          state.flaggedCount--;
        }
      }
    },
    
    // Settings
    updateSettings: (state, action: PayloadAction<Partial<ChatSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // UI controls
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setFilter: (state, action: PayloadAction<ChatState['selectedFilter']>) => {
      state.selectedFilter = action.payload;
    },
    
    setScrolledToBottom: (state, action: PayloadAction<boolean>) => {
      state.isScrolledToBottom = action.payload;
      if (action.payload) {
        state.unreadCount = 0;
      }
    },
    
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    
    // Slow mode
    setCanSendMessages: (state, action: PayloadAction<boolean>) => {
      state.canSendMessages = action.payload;
    },
    
    updateSlowModeRemaining: (state, action: PayloadAction<number>) => {
      state.slowModeRemaining = action.payload;
      state.canSendMessages = action.payload <= 0;
    },
    
    setLastMessageTime: (state, action: PayloadAction<number>) => {
      state.lastMessageTime = action.payload;
      if (state.settings.slowMode > 0) {
        state.canSendMessages = false;
        state.slowModeRemaining = state.settings.slowMode;
      }
    },
    
    // Typing indicators
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(user => user !== action.payload);
    },
    
    clearTypingUsers: (state) => {
      state.typingUsers = [];
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastMessageTime = Date.now();
        
        if (state.settings.slowMode > 0) {
          state.canSendMessages = false;
          state.slowModeRemaining = state.settings.slowMode;
        }
        
        // Message will be added via WebSocket or addMessage action
        state.error = null;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // React to message
    builder
      .addCase(reactToMessage.fulfilled, (state, action) => {
        // Reaction will be updated via WebSocket or addReaction action
      });

    // Moderate message
    builder
      .addCase(moderateMessage.fulfilled, (state, action) => {
        const { messageId, action: moderationAction } = action.payload;
        
        switch (moderationAction) {
          case 'approve':
            chatSlice.caseReducers.approveMessage(state, { payload: messageId, type: 'chat/approveMessage' });
            break;
          case 'reject':
            chatSlice.caseReducers.rejectMessage(state, { payload: messageId, type: 'chat/rejectMessage' });
            break;
          case 'delete':
            chatSlice.caseReducers.removeMessage(state, { payload: messageId, type: 'chat/removeMessage' });
            break;
          case 'flag':
            chatSlice.caseReducers.flagMessage(state, { payload: messageId, type: 'chat/flagMessage' });
            break;
        }
      });

    // Pin/unpin message
    builder
      .addCase(pinMessage.fulfilled, (state, action) => {
        chatSlice.caseReducers.setPinned(state, {
          payload: { messageId: action.payload.messageId, isPinned: true },
          type: 'chat/setPinned'
        });
      })
      .addCase(unpinMessage.fulfilled, (state, action) => {
        chatSlice.caseReducers.setPinned(state, {
          payload: { messageId: action.payload.messageId, isPinned: false },
          type: 'chat/setPinned'
        });
      });

    // Update settings
    builder
      .addCase(updateChatSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      });

    // Fetch history
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Prepend older messages
        state.messages = [...action.payload.messages, ...state.messages];
        state.error = null;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addMessage,
  removeMessage,
  updateMessage,
  addReaction,
  removeReaction,
  setPinned,
  approveMessage,
  rejectMessage,
  flagMessage,
  updateSettings,
  setEnabled,
  setMuted,
  setSearchQuery,
  setFilter,
  setScrolledToBottom,
  clearUnreadCount,
  setCanSendMessages,
  updateSlowModeRemaining,
  setLastMessageTime,
  addTypingUser,
  removeTypingUser,
  clearTypingUsers,
  clearError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;