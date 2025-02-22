import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { UserService } from './services/userService';
import { ConversationService } from './services/conversationService';
import { authMiddleware } from './middleware/auth';
import { AuthenticatedRequest } from './types/custom';
import { Request } from 'express';
import { ChatService } from './services/chatService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
});

const userService = new UserService();
const conversationService = new ConversationService();
const chatService = new ChatService();

app.use(cors());
app.use(express.json());

// 聊天接口
app.get('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message, conversationId } = req.query;
    const userId = (req as any).user.id;

    // 设置 SSE 头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 使用 ChatService 处理聊天
    const { stream, aiMessageId } = await chatService.chat(
      userId, 
      message as string, 
      conversationId as string
    );

    let fullAiResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullAiResponse += content;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    // 更新 AI 消息
    await chatService.updateAIMessage(aiMessageId, fullAiResponse);

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 注册接口
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await userService.register({ username, password });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await userService.login({ username, password });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// 管理 API 路由
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await userService.deleteUser(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 获取用户的所有对话
app.get('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const conversations = await conversationService.getUserConversations(userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: '获取对话列表失败' });
  }
});

// 获取单个对话及其消息
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await conversationService.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: '获取对话失败' });
  }
});

// 创建新对话
app.post('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const { title, id } = req.body;
    const userId = (req as any).user.id;
    const conversation = await conversationService.createConversation(userId, title, id);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: '创建对话失败' });
  }
});

// 添加消息
app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id, message, status } = req.body;
    const newMessage = await conversationService.addMessage({
      id,
      conversation_id: req.params.id,
      message,
      status
    });
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: '添加消息失败' });
  }
});

// 更新消息状态
app.patch('/api/messages/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await conversationService.updateMessageStatus(req.params.id, status);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '更新消息状态失败' });
  }
});

// 删除对话
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    await conversationService.deleteConversation(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除对话失败' });
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 