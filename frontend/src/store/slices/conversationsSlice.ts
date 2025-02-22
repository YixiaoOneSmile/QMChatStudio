import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../../services/api';

interface Message {
  id: string;
  message: string;
  status: 'local' | 'loading' | 'success';
  role?: 'local' | 'ai';
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

interface ApiConversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

const initialState: ConversationsState = {
  conversations: [{
    id: '0',
    title: '什么是 QMChatStudio?',
    messages: [],
    createdAt: Date.now().toString(),
    updatedAt: Date.now().toString(),
  }],
  activeConversationId: '0',
  status: 'idle',
  error: null,
};

// 添加获取对话列表的异步 action
export const fetchConversations = createAsyncThunk(
  'conversations/fetchAll',
  async () => {
    const response = await chatAPI.getConversations();
    const conversations = Array.isArray(response) ? response : response.data;
    return conversations.map((conv: ApiConversation) => ({
      id: conv.id,
      title: conv.title,
      messages: conv.messages,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    }));
  }
);

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    addConversation: (state, action: PayloadAction<{ title: string }>) => {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: action.payload.title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.conversations.push(newConversation);
      state.activeConversationId = newConversation.id;
    },
    addMessage: (state, action: PayloadAction<{ 
      conversationId: string, 
      message: Message 
    }>) => {
      const conversation = state.conversations.find(
        conv => conv.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.messages.push(action.payload.message);
      }
    },
    updateMessage: (state, action: PayloadAction<{
      conversationId: string,
      messageId: string,
      updates: Partial<Message>
    }>) => {
      const conversation = state.conversations.find(
        conv => conv.id === action.payload.conversationId
      );
      if (conversation) {
        const message = conversation.messages.find(
          msg => msg.id === action.payload.messageId
        );
        if (message) {
          Object.assign(message, action.payload.updates);
        }
      }
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        conv => conv.id !== action.payload
      );
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id || null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        if (JSON.stringify(state.conversations) !== JSON.stringify(action.payload)) {
          state.conversations = action.payload;
          
          const defaultConversation: Conversation = {
            id: Date.now().toString(),
            title: '新的对话',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          state.conversations.unshift(defaultConversation);
          state.activeConversationId = defaultConversation.id;
        }
        state.status = 'succeeded';
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const {
  setActiveConversation,
  addConversation,
  addMessage,
  updateMessage,
  deleteConversation,
} = conversationsSlice.actions;

export default conversationsSlice.reducer; 