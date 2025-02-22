import request from 'supertest';
import { pool } from '../config/database';
import { ConversationService } from '../services/conversationService';
import { UserService } from '../services/userService';
import express from 'express';
import { authMiddleware } from '../middleware/auth';

const app = express();
app.use(express.json());

const conversationService = new ConversationService();
const userService = new UserService();

// 设置路由
app.post('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const { title, id } = req.body;
    const userId = (req as any).user.id;
    const conversation = await conversationService.createConversation(userId, title, id);
    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const conversations = await conversationService.getUserConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id, message, status } = req.body;
    const newMessage = await conversationService.addMessage({
      id,
      conversation_id: req.params.id,
      message,
      status
    });
    res.json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await conversationService.updateMessageStatus(req.params.id, status);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

describe('Conversation and Message Management', () => {
  let testUserId: number;
  let authToken: string;
  let testConversationId: string;

  // 在所有测试开始前准备测试数据
  beforeAll(async () => {
    // 创建测试用户
    const testUser = await userService.register({
      username: 'test_conv_user',
      password: 'password123'
    });
    testUserId = testUser.id;

    // 获取认证令牌
    const loginResult = await userService.login({
      username: 'test_conv_user',
      password: 'password123'
    });
    authToken = loginResult.token;
  });

  // 在所有测试结束后清理测试数据
  afterAll(async () => {
    await pool.execute('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = ?)', [testUserId]);
    await pool.execute('DELETE FROM conversations WHERE user_id = ?', [testUserId]);
    await pool.execute('DELETE FROM users WHERE username = ?', ['test_conv_user']);
    await pool.end();
  });

  describe('Conversation Operations', () => {
    it('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: 'test-conv-1',
          title: 'Test Conversation'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'test-conv-1');
      expect(response.body).toHaveProperty('title', 'Test Conversation');
      testConversationId = response.body.id;
    });

    it('should get user conversations', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title');
    });
  });

  describe('Message Operations', () => {
    it('should add a message to conversation', async () => {
      const response = await request(app)
        .post(`/api/conversations/${testConversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: 'test-msg-1',
          message: 'Hello, this is a test message',
          status: 'success'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'test-msg-1');
      expect(response.body).toHaveProperty('message', 'Hello, this is a test message');
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should handle message status updates', async () => {
      const messageId = 'test-msg-2';
      
      // 先创建一个处于 loading 状态的消息
      await request(app)
        .post(`/api/conversations/${testConversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: messageId,
          message: 'This message will be updated',
          status: 'loading'
        });

      // 更新消息状态
      const response = await request(app)
        .patch(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'success'
        });

      expect(response.status).toBe(200);
      
      // 验证状态已更新
      const conversation = await conversationService.getConversation(testConversationId);
      const updatedMessage = conversation?.messages.find(m => m.id === messageId);
      expect(updatedMessage?.status).toBe('success');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid conversation ID', async () => {
      const response = await request(app)
        .post('/api/conversations/invalid-id/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: 'test-msg-3',
          message: 'This should fail',
          status: 'success'
        });

      expect(response.status).toBe(500);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/conversations');

      expect(response.status).toBe(401);
    });
  });
}); 