export interface Conversation {
  id: string;
  user_id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  message: string;
  status: 'local' | 'loading' | 'success';
  created_at?: string;
  role?: 'local' | 'ai';
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
} 