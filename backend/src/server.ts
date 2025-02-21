import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { UserService } from './services/userService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
});

const userService = new UserService();

app.use(cors());
app.use(express.json());

// 修改为 GET 请求
app.get('/api/chat', async (req, res) => {
  try {
    const { message } = req.query;
    
    // 设置 SSE 头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 先发送一个空的 delta 内容，触发前端的 loading 状态
    res.write(`data: ${JSON.stringify({
      choices: [{ delta: { content: null } }]
    })}\n\n`);

    // 添加 5 秒延迟
    // await new Promise(resolve => setTimeout(resolve, 5000));

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message as string }],
      stream: true,
    });

    // 处理流式响应
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

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

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 