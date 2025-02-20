import React, { useContext } from 'react';
import { Menu } from 'antd';
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

  const menuItems = [
    {
      key: 'new',
      icon: <PlusOutlined />,
      label: '新建对话',
      onClick: onAddConversation,
    },
    ...conversations.map(conv => ({
      key: conv.key,
      label: conv.label,
    })),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

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
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        items={menuItems}
        onClick={({ key }) => {
          if (!['new', 'logout'].includes(key)) {
            onActiveChange(key);
          }
        }}
      />
    </div>
  );
}; 