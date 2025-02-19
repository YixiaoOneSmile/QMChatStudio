// API 调用封装
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export const chatAPI = {
  sendMessage: async (conversationId: string, message: string, modelId: string) => {
    return api.post('/chat', { conversationId, message, modelId });
  },
  getConversations: async () => {
    return api.get('/conversations');
  },
  // ... 其他 API 调用
}; 