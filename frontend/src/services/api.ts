// API 调用封装
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
});

// 添加请求拦截器设置 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },
  register: async (username: string, password: string) => {
    const response = await api.post('/api/register', { username, password });
    return response.data;
  }
};

export const chatAPI = {
  sendMessage: async (message: string, conversationId?: string) => {
    // 构建查询参数
    const queryParams = new URLSearchParams({
      message: message,
      ...(conversationId && { conversationId })
    });

    // 使用 EventSource 处理流式响应
    const response = await fetch(`${api.defaults.baseURL}/api/chat?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'text/event-stream',
      },
    });

    return response.body;
  },

  getConversations: async () => {
    const response = await api.get('/api/conversations');
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await api.get(`/api/conversations/${id}`);
    return response.data;
  }
}; 