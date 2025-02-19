import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Button, Space, Badge } from 'antd';
import { 
  Bubble, 
  Sender, 
  Welcome, 
  useXAgent, 
  useXChat,
  Conversations,
  Prompts,
  Attachments,
} from '@ant-design/x';
import {
  ShareAltOutlined,
  EllipsisOutlined,
  PlusOutlined,
  FireOutlined,
  ReadOutlined,
  PaperClipOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import type { RootState } from '../../store';
import type { GetProp } from 'antd';
import styles from './ChatLayout.module.css';

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

const defaultConversations = [
  {
    key: '0',
    label: '什么是 QMChatStudio?',
  },
];

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

export const ChatLayout: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [content, setContent] = React.useState('');
  const [conversations, setConversations] = React.useState(defaultConversations);
  const [activeKey, setActiveKey] = React.useState(defaultConversations[0].key);
  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>([]);
  const [headerOpen, setHeaderOpen] = React.useState(false);

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!message) {
        console.error('消息不能为空');
        return;
      }

      try {
        // 先发送一个空字符串来触发 loading 状态
        onUpdate('');

        const es = new EventSource(`http://localhost:3001/api/chat?message=${encodeURIComponent(message)}`);
        let currentContent = '';
        let hasReceivedContent = false;  // 标记是否收到过内容

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
              // 收到实际内容
              hasReceivedContent = true;
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

  const { messages, onRequest, setMessages } = useXChat({ agent });

  React.useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey, setMessages]);

  const handleSubmit = (message: string) => {
    if (!message) return;
    onRequest(message);
    setContent('');
  };

  const handleAddConversation = () => {
    const newConversation = {
      key: `${conversations.length}`,
      label: `新对话 ${conversations.length}`,
    };
    setConversations([...conversations, newConversation]);
    setActiveKey(newConversation.key);
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

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        <div className={styles.logo}>
          <img
            src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
            alt="logo"
          />
          <span>QMChatStudio</span>
        </div>
        <Button
          onClick={handleAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          新建对话
        </Button>
        <Conversations
          items={conversations}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={setActiveKey}
        />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.headerExtra}>
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        </div>
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
        </div>
        <div className={styles.senderArea}>
          <Sender
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            loading={agent.isRequesting()}
            header={senderHeader}
            prefix={attachmentsNode}
          />
        </div>
      </div>
    </div>
  );
}; 