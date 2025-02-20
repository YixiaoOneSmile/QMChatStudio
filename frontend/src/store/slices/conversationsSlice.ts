import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  message: string;
  status: 'local' | 'loading' | 'success';
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
}

const initialState: ConversationsState = {
  conversations: [{
    id: '0',
    title: '什么是 QMChatStudio?',
    messages: [],
    createdAt: Date.now(),
  }],
  activeConversationId: '0',
};

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
        createdAt: Date.now(),
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
});

export const {
  setActiveConversation,
  addConversation,
  addMessage,
  updateMessage,
  deleteConversation,
} = conversationsSlice.actions;

export default conversationsSlice.reducer; 