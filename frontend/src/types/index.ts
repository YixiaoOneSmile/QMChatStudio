// 定义核心类型
export interface User {
  id: string;
  name: string;
  avatar?: string;
  token?: string;  // 添加 token 字段
  // ... 其他用户相关信息
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  status: 'success' | 'error' | 'loading';
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  avatar?: string;
} 