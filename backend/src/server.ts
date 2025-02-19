import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
});

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

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 