import request from 'supertest';
import { pool } from '../config/database';
import { ConversationService } from '../services/conversationService';
import { UserService } from '../services/userService';
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const conversationService = new ConversationService();
const userService = new UserService();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
});

// 设置聊天路由
app.get('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message, conversationId } = req.query;
    const userId = (req as any).user.id;

    let conversation;
    if (!conversationId) {
      const title = (message as string).slice(0, 20) + '...';
      conversation = await conversationService.createConversation(
        userId,
        title,
        Date.now().toString()
      );
    } else {
      conversation = await conversationService.getConversation(conversationId as string);
      if (!conversation) {
        return res.status(404).json({ error: '对话不存在' });
      }
    }

    const userMessageId = `msg_${Date.now()}_user`;
    await conversationService.addMessage({
      id: userMessageId,
      conversation_id: conversation.id,
      message: message as string,
      status: 'success'
    });
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const aiMessageId = `msg_${Date.now()}_ai`;
    await conversationService.addMessage({
      id: aiMessageId,
      conversation_id: conversation.id,
      message: '',
      status: 'loading'
    });

    res.write(`data: ${JSON.stringify({
      choices: [{ delta: { content: null } }]
    })}\n\n`);

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message as string }],
      stream: true,
    });

    let fullAiResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullAiResponse += content;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    await conversationService.updateMessage(aiMessageId, {
      message: fullAiResponse,
      status: 'success'
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

describe('Chat Flow', () => {
  let testUserId: number;
  let authToken: string;
  let testConversationId: string;

  // 在所有测试开始前准备测试数据
  beforeAll(async () => {
    // 创建测试用户
    const testUser = await userService.register({
      username: 'test_chat_user',
      password: 'password123'
    });
    testUserId = testUser.id;

    // 获取认证令牌
    const loginResult = await userService.login({
      username: 'test_chat_user',
      password: 'password123'
    });
    authToken = loginResult.token;
  });

  // 在所有测试结束后清理测试数据
  afterAll(async () => {
    await pool.execute('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = ?)', [testUserId]);
    await pool.execute('DELETE FROM conversations WHERE user_id = ?', [testUserId]);
    await pool.execute('DELETE FROM users WHERE username = ?', ['test_chat_user']);
    await pool.end();
  });

  describe('Chat Operations', () => {
    it('should create a new conversation when no conversationId is provided', async () => {
      const response = await request(app)
        .get('/api/chat')
        .query({ message: 'Hello, this is a test message' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('Accept', 'text/event-stream');

      expect(response.status).toBe(200);
      
      // 验证是否创建了新对话
      const conversations = await conversationService.getUserConversations(testUserId);
      expect(conversations.length).toBeGreaterThan(0);
      testConversationId = conversations[0].id;

      // 验证是否创建了消息
      const conversation = await conversationService.getConversation(testConversationId);
      expect(conversation?.messages.length).toBe(2); // 用户消息和AI响应
      expect(conversation?.messages[0].status).toBe('success');
      expect(conversation?.messages[1].status).toBe('success');
    });

    it('should use existing conversation when conversationId is provided', async () => {
      const response = await request(app)
        .get('/api/chat')
        .query({ 
          message: 'This is a follow-up message',
          conversationId: testConversationId 
        })
        .set('Authorization', `Bearer ${authToken}`)
        .set('Accept', 'text/event-stream');

      expect(response.status).toBe(200);

      // 验证消息是否被添加到现有对话
      const conversation = await conversationService.getConversation(testConversationId);
      expect(conversation?.messages.length).toBe(4); // 之前的2条加上新的2条
    });

    it('should handle invalid conversation ID', async () => {
      const response = await request(app)
        .get('/api/chat')
        .query({ 
          message: 'This should fail',
          conversationId: 'invalid-id' 
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/chat')
        .query({ message: 'This should fail' });

      expect(response.status).toBe(401);
    });
  });
}); 