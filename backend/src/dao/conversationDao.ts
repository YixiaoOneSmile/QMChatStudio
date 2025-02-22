import { pool } from '../config/database';
import { Conversation, Message, ConversationWithMessages } from '../types/conversation';
import { RowDataPacket } from 'mysql2';

interface MessageUpdate {
  message?: string;
  status?: 'local' | 'loading' | 'success';
}

export class ConversationDao {
  async findByUserId(userId: number): Promise<Conversation[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Conversation[];
  }

  async findById(id: string): Promise<ConversationWithMessages | null> {
    const [conversations] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.id as conversation_id,
        c.user_id,
        c.title,
        c.created_at,
        m.id as message_id,
        m.message,
        m.status,
        m.role
       FROM conversations c 
       LEFT JOIN messages m ON c.id = m.conversation_id 
       WHERE c.id = ?`,
      [id]
    );

    if (!conversations.length) return null;

    const result = conversations.reduce((acc: any, row: any) => {
      if (!acc.id) {
        acc = {
          id: row.conversation_id,
          user_id: row.user_id,
          title: row.title,
          created_at: row.created_at,
          messages: []
        };
      }

      if (row.message) {
        acc.messages.push({
          id: row.message_id,
          conversation_id: row.conversation_id,
          message: row.message,
          status: row.status || 'success',
          role: row.role || 'local'
        });
      }

      return acc;
    }, {});

    return result;
  }

  async create(userId: number, title: string, id: string): Promise<Conversation> {
    await pool.execute(
      'INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)',
      [id, userId, title]
    );
    
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE id = ?',
      [id]
    );
    return (rows as Conversation[])[0];
  }

  async addMessage(message: Omit<Message, 'created_at'>): Promise<Message> {
    const [result] = await pool.execute(
      `INSERT INTO messages (id, conversation_id, message, status, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        message.id,
        message.conversation_id,
        message.message,
        message.status,
        message.role || 'local'  // 添加 role 字段
      ]
    );
    return message as Message;
  }

  async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    await pool.execute(
      'UPDATE messages SET status = ? WHERE id = ?',
      [status, messageId]
    );
  }

  async deleteConversation(id: string): Promise<void> {
    await pool.execute('DELETE FROM conversations WHERE id = ?', [id]);
  }

  async updateMessage(messageId: string, update: MessageUpdate): Promise<void> {
    const setClause = Object.entries(update)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(update), messageId];

    await pool.execute(
      `UPDATE messages SET ${setClause} WHERE id = ?`,
      values
    );
  }
} 