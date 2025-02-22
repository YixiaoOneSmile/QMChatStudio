import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { addMessage, updateMessage } from '../../store/slices/conversationsSlice';
import { chatAPI } from '../../services/api';

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
// 默认的提示词列表
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

type BubbleItem = GetProp<typeof Bubble.List, 'items'>[number];

export const ChatArea: React.FC<ChatAreaProps> = ({ conversationId }) => {
  const dispatch = useDispatch();
  // 从 Redux 获取当前会话的消息
  const conversation = useSelector((state: RootState) => {
    const conv = state.conversations.conversations.find(conv => conv.id === conversationId);
    return conv;
  });
  const { currentModel } = useSelector((state: RootState) => state.models);
  const [content, setContent] = React.useState('');
  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>([]);
  const [headerOpen, setHeaderOpen] = React.useState(false);

  // 保存当前的 conversationId 到 ref，这样在异步操作中也能访问到正确的值
  const currentConversationId = React.useRef(conversationId);
  
  React.useEffect(() => {
    currentConversationId.current = conversationId;
  }, [conversationId]);

  const [agent] = useXAgent({
    baseURL: 'http://localhost:3001/api',
    model: currentModel?.id,
    request: async ({ message }, { onSuccess, onUpdate }) => {
      // 使用 ref 中的 conversationId，确保总是使用当前激活的会话 ID
      const activeConversationId = currentConversationId.current;
      if (!message || !activeConversationId) return;

      // 添加用户消息到 Redux
      const messageId = Date.now().toString();
      dispatch(addMessage({
        conversationId: activeConversationId,
        message: {
          id: messageId,
          message,
          status: 'local',
          role: 'local'
        }
      }));

      try {
        // 添加 AI 响应消息，初始状态为 loading
        const aiMessageId = (Date.now() + 1).toString();
        dispatch(addMessage({
          conversationId: activeConversationId,
          message: {
            id: aiMessageId,
            message: '',
            status: 'loading',
            role: 'ai'
          }
        }));

        // 使用 EventSource 处理流式响应，传递 conversationId
        const stream = await chatAPI.sendMessage(message, activeConversationId);
        if (!stream) throw new Error('No response stream');

        const reader = stream.getReader();
        let currentContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  currentContent += content;
                  dispatch(updateMessage({
                    conversationId: activeConversationId,
                    messageId: aiMessageId,
                    updates: { 
                      message: currentContent,
                    }
                  }));
                  onUpdate(currentContent);
                }
              } catch (e) {
                console.error('解析响应数据错误:', e);
              }
            }
          }
        }

        // 更新最终状态
        dispatch(updateMessage({
          conversationId: activeConversationId,
          messageId: aiMessageId,
          updates: { 
            status: 'success',
            message: currentContent 
          }
        }));
        onSuccess(currentContent);

      } catch (error) {
        console.error('发送消息错误:', error);
        onSuccess('');
      }
    },
  });

  // 使用 XChat 组件，管理当前会话的消息
  const {  setMessages, onRequest } = useXChat({ 
    agent,
    // 添加 defaultMessages，确保每次组件挂载时都使用正确的初始消息
    defaultMessages: conversation?.messages || [],
  });

  // 当 conversationId 变化时，从 Redux 加载对应会话的消息
  React.useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [conversationId, conversation?.messages, setMessages]);

  const handleSubmit = (message: string) => {
    if (!message || !conversationId) return;
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

  // 根据当前会话的消息生成消息列表
  const messageItems = React.useMemo<BubbleItem[]>(() => {
    if (!conversation?.messages?.length) {
      // 如果当前会话没有消息，则显示欢迎消息
      return [{
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
        variant: 'borderless' as const,
      }];
    }

    // 将消息转换为气泡项
    return conversation.messages.map(({ id, message, status, role }) => ({
      key: id,
      role: role === 'local' ? 'local' : 'ai',
      content: message,
      loading: status === 'loading' && !message,
      typing: status === 'loading' && message ? { step: 5, interval: 20 } : undefined,
      variant: role === 'local' ? 'shadow' as const : undefined,
    }));
  }, [conversation?.messages]);

  // 附件节点
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

  // 返回聊天区域组件
  return (
    <div className={styles.chatArea}>
      <Bubble.List
        className={styles.messages}
        roles={roles}
        items={messageItems}
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