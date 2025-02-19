import React from 'react';
import { Bubble } from '@ant-design/x';
import type { Conversation } from '../../types';

interface Props {
  conversation: Conversation | null;
}

export const MessageList: React.FC<Props> = ({ conversation }) => {
  if (!conversation) return null;
  
  return (
    <div>
      {conversation.messages.map(message => (
        <Bubble
          key={message.id}
          content={message.content}
          role={message.role === 'user' ? 'local' : 'ai'}
        />
      ))}
    </div>
  );
}; 