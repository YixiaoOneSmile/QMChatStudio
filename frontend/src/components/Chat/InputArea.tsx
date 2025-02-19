import React, { useState } from 'react';
import { Sender } from '@ant-design/x';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (message: string) => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message);
    setContent('');
  };

  return (
    <Sender
      value={content}
      onChange={setContent}
      onSubmit={handleSubmit}
      loading={isLoading}
    />
  );
}; 