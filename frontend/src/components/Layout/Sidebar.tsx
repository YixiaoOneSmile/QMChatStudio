import React, { useContext } from 'react';
import { Button } from 'antd';
import { Conversations } from '@ant-design/x';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  conversations: Array<{
    key: string;
    label: string;
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

  return (
    <div className={styles.container}>
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
          type="text" 
          icon={<PlusOutlined />} 
          onClick={onAddConversation}
          block
        >
          新建对话
        </Button>
      </div>
      <div className={styles.conversationList}>
        <Conversations
          items={conversations}
          activeKey={activeKey}
          onActiveChange={onActiveChange}
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