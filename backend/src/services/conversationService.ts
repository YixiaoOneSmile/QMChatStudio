import { ConversationDao } from '../dao/conversationDao';
import { Conversation, Message, ConversationWithMessages } from '../types/conversation';
import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

interface MessageUpdate {
  message?: string;
  status?: 'local' | 'loading' | 'success';
}

export class ConversationService {
  private conversationDao: ConversationDao;

  constructor() {
    this.conversationDao = new ConversationDao();
  }

  async getUserConversations(userId: number): Promise<ConversationWithMessages[]> {
    // 1. 先获取所有对话
    const [conversations] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM conversations 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // 2. 获取所有对话的消息
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv: any) => {
        const [messages] = await pool.execute<RowDataPacket[]>(
          `SELECT * FROM messages 
           WHERE conversation_id = ? 
           ORDER BY created_at ASC`,
          [conv.id]
        );

        return {
          id: conv.id,
          user_id: conv.user_id,
          title: conv.title,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          messages: messages.map(msg => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            message: msg.message,
            status: msg.status || 'success',
            role: msg.role as 'local' | 'ai'
          }))
        };
      })
    );

    return conversationsWithMessages;
  }

  async getConversation(id: string): Promise<ConversationWithMessages | null> {
    return this.conversationDao.findById(id);
  }

  async createConversation(userId: number, title: string, id: string): Promise<Conversation> {
    return this.conversationDao.create(userId, title, id);
  }

  async addMessage(message: Omit<Message, 'created_at'>): Promise<Message> {
    return this.conversationDao.addMessage(message);
  }

  async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    await this.conversationDao.updateMessageStatus(messageId, status);
  }

  async deleteConversation(id: string): Promise<void> {
    await this.conversationDao.deleteConversation(id);
  }

  async updateMessage(messageId: string, update: MessageUpdate): Promise<void> {
    await this.conversationDao.updateMessage(messageId, update);
  }

  async getRecentMessages(conversationId: string, limit: number) {
    return await this.conversationDao.getRecentMessages(conversationId, limit);
  }
} 