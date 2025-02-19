import { createSlice } from '@reduxjs/toolkit';
import type { Conversation } from '../../types';

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversations: [] as Conversation[],
    currentConversation: null as Conversation | null,
  },
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
  },
});

export const { setCurrentConversation } = conversationsSlice.actions;
export default conversationsSlice.reducer; 