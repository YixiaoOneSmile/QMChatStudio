import React from 'react';
import { useSelector } from 'react-redux';
import { useXAgent, useXChat, Bubble, Welcome, Prompts, Sender, Attachments } from '@ant-design/x';
import { Button, Badge, Space } from 'antd';
import { 
  FireOutlined, 
  ReadOutlined, 
  PaperClipOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import type { GetProp } from 'antd';
import type { RootState } from '../../store';
import styles from './ChatArea.module.css';

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
};

const defaultPrompts = [
  {
    key: 'whats-new',
    icon: <FireOutlined />,
    title: "What's new in X?",
    description: "Learn about the latest features",
  },
  {
    key: 'whats-agi',
    icon: <ReadOutlined />,
    title: "What's AGI?",
    description: "Understanding Artificial General Intelligence",
  },
  {
    key: 'where-doc',
    icon: <ReadOutlined />,
    title: 'Where is the doc?',
    description: "Find documentation and guides",
  },
];

interface ChatAreaProps {
  conversationId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ conversationId }) => {
  const { currentModel } = useSelector((state: RootState) => state.models);
  const [content, setContent] = React.useState('');
  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>([]);
  const [headerOpen, setHeaderOpen] = React.useState(false);

  const [agent] = useXAgent({
    baseURL: 'http://localhost:3001/api',
    model: currentModel?.id,
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!message) {
        console.error('消息不能为空');
        return;
      }

      try {
        onUpdate('');

        const es = new EventSource(`http://localhost:3001/api/chat?message=${encodeURIComponent(message)}`);
        let currentContent = '';

        es.onmessage = (event) => {
          const data = event.data || '';
          if (data === '[DONE]') {
            es.close();
            onSuccess(currentContent);
            return;
          }

          try {
            const obj = JSON.parse(data);
            const content = obj.choices[0]?.delta?.content;
            
            if (content) {
              currentContent += content;
              onUpdate(currentContent);
            }
          } catch (e) {
            console.error('解析响应数据错误:', e);
            es.close();
          }
        };

        es.onerror = (error) => {
          console.error('EventSource 错误:', error);
          es.close();
        };

      } catch (error) {
        console.error('发送消息错误:', error);
      }
    },
  });

  const { messages, onRequest, setMessages } = useXChat({ 
    agent,
  });

  // 重置消息
  const resetChat = React.useCallback(() => {
    setMessages([]);
    setContent('');
  }, [setMessages]);

  // 监听 conversationId 变化
  React.useEffect(() => {
    resetChat();
  }, [conversationId, resetChat]);

  const handleSubmit = (message: string) => {
    if (!message) return;
    onRequest(message);
    setContent('');
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) => {
    setAttachedFiles(info.fileList);
  };

  const handlePromptsItemClick = (info: { data: GetProp<typeof Prompts, 'items'>[number] }) => {
    if (info.data.description) {
      setContent(info.data.description as string);
    }
  };


  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button 
        type="text" 
        icon={<PaperClipOutlined />} 
        onClick={() => setHeaderOpen(!headerOpen)} 
      />
    </Badge>
  );

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );

  return (
    <div className={styles.chatArea}>
      <Bubble.List
        className={styles.messages}
        roles={roles}
        items={
          messages.length > 0
            ? messages.map(({ id, message, status }) => ({
                key: id,
                role: status === 'local' ? 'local' : 'ai',
                content: message,
                loading: status === 'loading' && !message,
              }))
            : [{
                key: 'welcome',
                content: (
                  <Space direction="vertical" size={16} className={styles.placeholder}>
                    <Welcome
                      variant="borderless"
                      icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                      title="Hello, I'm QMChatStudio"
                      description="Base on Ant Design, AGI product interface solution, create a better intelligent vision"
                    />
                    <Prompts 
                      items={defaultPrompts} 
                      onItemClick={handlePromptsItemClick}
                    />
                  </Space>
                ),
                variant: 'borderless',
              }]
        }
      />
      <Sender
        value={content}
        onChange={setContent}
        onSubmit={handleSubmit}
        loading={agent.isRequesting()}
        header={senderHeader}
        prefix={attachmentsNode}
      />
    </div>
  );
}; 