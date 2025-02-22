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
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
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
        c.updated_at,
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
          updated_at: row.updated_at,
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
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        `INSERT INTO messages (id, conversation_id, message, status, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          message.id,
          message.conversation_id,
          message.message,
          message.status,
          message.role || 'local'
        ]
      );

      await connection.execute(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [message.conversation_id]
      );

      await connection.commit();
      return message as Message;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [messages] = await connection.execute<RowDataPacket[]>(
        'SELECT conversation_id FROM messages WHERE id = ?',
        [messageId]
      );
      
      if (messages.length > 0) {
        const conversationId = messages[0].conversation_id;

        await connection.execute(
          'UPDATE messages SET status = ? WHERE id = ?',
          [status, messageId]
        );

        await connection.execute(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteConversation(id: string): Promise<void> {
    await pool.execute('DELETE FROM conversations WHERE id = ?', [id]);
  }

  async updateMessage(messageId: string, update: MessageUpdate): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [messages] = await connection.execute<RowDataPacket[]>(
        'SELECT conversation_id FROM messages WHERE id = ?',
        [messageId]
      );
      
      if (messages.length > 0) {
        const conversationId = messages[0].conversation_id;

        const setClause = Object.entries(update)
          .map(([key]) => `${key} = ?`)
          .join(', ');
        const values = [...Object.values(update), messageId];
        await connection.execute(
          `UPDATE messages SET ${setClause} WHERE id = ?`,
          values
        );

        await connection.execute(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
} 