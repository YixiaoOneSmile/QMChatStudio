import React, { useContext } from 'react';
import { Button, Space } from 'antd';
import { Conversations } from '@ant-design/x';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import styles from './Sidebar.module.css';
import type { ConversationsProps } from '@ant-design/x';
import { type GetProp } from 'antd';

interface SidebarProps {
  conversations: Array<{
    key: string;
    label: string;
    updatedAt: string;
  }>;
  activeKey: string;
  onActiveChange: (key: string) => void;
  onAddConversation: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeKey,
  onActiveChange,
  onAddConversation,
  onLogout,
}) => {
  const { darkMode } = useContext(ThemeContext);

  // 处理对话列表，添加分组信息
  const processedConversations = conversations.map(conv => {
    const now = new Date();
    const updateTime = new Date(conv.updatedAt);
    
    // 判断是今天、昨天还是更早
    let group = '更早';
    if (
      updateTime.getDate() === now.getDate() &&
      updateTime.getMonth() === now.getMonth() &&
      updateTime.getFullYear() === now.getFullYear()
    ) {
      group = '今天';
    } else if (
      updateTime.getDate() === now.getDate() - 1 &&
      updateTime.getMonth() === now.getMonth() &&
      updateTime.getFullYear() === now.getFullYear()
    ) {
      group = '昨天';
    }

    return {
      ...conv,
      group,
    };
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // 定义分组配置
  const groupable: GetProp<typeof Conversations, 'groupable'> = {
    sort(a, b) {
      if (a === b) return 0;
      const order = ['今天', '昨天', '更早'];
      return order.indexOf(a) - order.indexOf(b);
    },
  };

  return (
    <div className={`${styles.container} ${darkMode ? 'dark' : ''}`}>
      <div className={styles.logo}>
        <img
          src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
          alt="logo"
          style={{ filter: darkMode ? 'invert(1)' : 'none' }}
        />
        <span style={{ color: darkMode ? '#fff' : '#000' }}>QMChatStudio</span>
      </div>
      <div className={styles.newChat}>
        <Button 
          icon={<PlusOutlined />} 
          onClick={onAddConversation}
          block
        >
          新建对话
        </Button>
      </div>
      <div className={styles.conversationList}>
        <Conversations
          items={processedConversations}
          activeKey={activeKey}
          onActiveChange={onActiveChange}
          groupable={groupable}
        />
      </div>
      <div className={styles.footer}>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={onLogout}
          block
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}; 