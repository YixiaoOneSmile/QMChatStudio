import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bubble, Sender } from '@ant-design/x';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ModelSelector } from './ModelSelector';
import type { RootState } from '../../store';
import styles from './ChatArea.module.css';

export const ChatArea: React.FC = () => {
  const dispatch = useDispatch();
  const { currentConversation } = useSelector((state: RootState) => state.conversations);
  const { currentModel } = useSelector((state: RootState) => state.models);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('网络响应不正确');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法获取响应流');

      let assistantMessage = '';

      // 这里需要dispatch一个action来添加AI的空消息
      dispatch({
        type: 'conversations/addMessage',
        payload: {
          conversationId: currentConversation?.id,
          message: {
            role: 'assistant',
            content: '',
          },
        },
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;
              
              // 更新最后一条AI消息
              dispatch({
                type: 'conversations/updateLastMessage',
                payload: {
                  conversationId: currentConversation?.id,
                  content: assistantMessage,
                },
              });
            } catch (e) {
              console.error('解析响应数据错误:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息错误:', error);
      dispatch({
        type: 'conversations/addMessage',
        payload: {
          conversationId: currentConversation?.id,
          message: {
            role: 'assistant',
            content: '抱歉，发生了一些错误。请稍后重试。',
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatArea}>
      <ModelSelector />
      <MessageList conversation={currentConversation} />
      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}; 