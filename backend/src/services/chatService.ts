import { OpenAI } from 'openai';
import { ConversationService } from './conversationService';
import { Message } from '../types/conversation';

export class ChatService {
  private openai: OpenAI;
  private conversationService: ConversationService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_URL,
    });
    this.conversationService = new ConversationService();
  }

  async chat(userId: number, message: string, conversationId?: string) {
    // 处理对话
    let conversation;
    if (!conversationId) {
      const title = message.slice(0, 20) + '...';
      conversation = await this.conversationService.createConversation(
        userId,
        title,
        Date.now().toString()
      );
    } else {
      conversation = await this.conversationService.getConversation(conversationId);
      if (!conversation) {
        const title = message.slice(0, 20) + '...';
        conversation = await this.conversationService.createConversation(
          userId,
          title,
          conversationId
        );
      }
    }

    // 获取历史消息
    const messageHistory = await this.conversationService.getRecentMessages(conversation.id, 10);

    // 保存用户消息
    const userMessageId = `msg_${Date.now()}_user`;
    await this.conversationService.addMessage({
      id: userMessageId,
      conversation_id: conversation.id,
      message: message,
      status: 'success',
      role: 'local'
    });

    // 创建 AI 消息占位符
    const aiMessageId = `msg_${Date.now()}_ai`;
    await this.conversationService.addMessage({
      id: aiMessageId,
      conversation_id: conversation.id,
      message: '',
      status: 'loading',
      role: 'ai'
    });

    // @ts-ignore
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...messageHistory.map(msg => ({
          role: msg.role === 'local' ? 'user' : 'assistant',
          content: msg.message
        })),
        { role: "user", content: message }
      ],
      stream: true,
    });

    return {
      stream,
      aiMessageId,
      conversation
    };
  }

  async updateAIMessage(messageId: string, content: string) {
    await this.conversationService.updateMessage(messageId, {
      message: content,
      status: 'success'
    });
  }
} 