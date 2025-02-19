import React from 'react';
import { createStyles } from 'antd-style';
import { Button, Space, type GetProp, Badge } from 'antd';
import type { GlobalToken } from 'antd/es/theme';
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
  HeartOutlined,
  SmileOutlined,
  CommentOutlined,
  PaperClipOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';

const useStyles = createStyles(({ token }: { token: GlobalToken }) => ({
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    background: token.colorBgContainer,
    overflow: 'hidden',
  },
  menu: {
    background: `${token.colorBgLayout}80`,
    width: 280,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    display: 'flex',
    height: 72,
    alignItems: 'center',
    padding: '0 24px',
    
    '& img': {
      width: 24,
      height: 24,
    },
    
    '& span': {
      marginLeft: 8,
      fontWeight: 'bold',
      fontSize: 16,
    },
  },
  addBtn: {
    background: '#1677ff0f',
    border: '1px solid #1677ff34',
    width: 'calc(100% - 24px)',
    margin: '0 12px 24px 12px',
  },
  conversations: {
    padding: '0 12px',
    flex: 1,
    overflowY: 'auto',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  headerExtra: {
    position: 'absolute',
    right: token.paddingLG,
    top: token.paddingLG,
    zIndex: 10,
  },
  chatArea: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    margin: '0 auto',
    padding: token.paddingLG,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  messages: {
    flex: 1,
    overflow: 'auto',
  },
  placeholder: {
    paddingTop: 32,
    width: '100%',
  },
  senderArea: {
    width: '100%',
    maxWidth: 960,
    margin: '0 auto',
    padding: `16px ${token.paddingLG}px`,
    background: token.colorBgContainer,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
}));

const defaultConversations = [
  {
    key: '0',
    label: '什么是 Ant Design X?',
  },
];

const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    label: (
      <Space align="start">
        <FireOutlined style={{ color: '#FF4D4F' }} />
        <span>Hot Topics</span>
      </Space>
    ),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: (
      <Space align="start">
        <ReadOutlined style={{ color: '#1890FF' }} />
        <span>Design Guide</span>
      </Space>
    ),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];

const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: <ReadOutlined style={{ color: '#1890FF' }} />,
  },
];

const App: React.FC = () => {
  const { styles } = useStyles();
  const [content, setContent] = React.useState('');
  const [conversations, setConversations] = React.useState(defaultConversations);
  const [activeKey, setActiveKey] = React.useState(defaultConversations[0].key);
  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>([]);
  const [headerOpen, setHeaderOpen] = React.useState(false);

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess }) => {
      onSuccess(`收到消息：${message}`);
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

  const handlePromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    onRequest(info.data.description as string);
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) => {
    setAttachedFiles(info.fileList);
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
          New Conversation
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
            items={
              messages.length > 0
                ? messages.map(({ id, message, status }) => ({
                    key: id,
                    role: status === 'local' ? 'local' : 'ai',
                    content: message,
                    loading: status === 'loading',
                  }))
                : [{
                    content: (
                      <Space direction="vertical" size={16} className={styles.placeholder}>
                        <Welcome
                          variant="borderless"
                          icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                          title="Hello, I'm Ant Design X"
                          description="Base on Ant Design, AGI product interface solution, create a better intelligent vision"
                        />
                        <Prompts
                          title="Do you want?"
                          items={placeholderPromptsItems}
                          styles={{
                            list: {
                              width: '100%',
                            },
                            item: {
                              flex: 1,
                            },
                          }}
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
          <Prompts items={senderPromptsItems} onItemClick={handlePromptsItemClick} />
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

export default App;