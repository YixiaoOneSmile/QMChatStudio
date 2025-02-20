import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Button, Space, Dropdown, Layout } from 'antd';
import { 
  ShareAltOutlined,
  EllipsisOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { RootState } from '../../store';
import { ThemeContext } from '../../contexts/ThemeContext';
import styles from './ChatLayout.module.css';
import { Sidebar } from './Sidebar';
import { ChatArea } from '../Chat/ChatArea';

const { Sider, Content } = Layout;

const defaultConversations = [
  {
    key: '0',
    label: '什么是 QMChatStudio?',
  },
];

export const ChatLayout: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [conversations, setConversations] = React.useState(defaultConversations);
  const [activeKey, setActiveKey] = React.useState(defaultConversations[0].key);

  const handleAddConversation = () => {
    const newConversation = {
      key: `${conversations.length}`,
      label: `新对话 ${conversations.length}`,
    };
    setConversations([...conversations, newConversation]);
    setActiveKey(newConversation.key);
  };

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'theme',
      icon: <BulbOutlined />,
      label: darkMode ? '切换亮色模式' : '切换暗黑模式',
      onClick: handleThemeChange,
    },
  ];

  const handleLogout = () => {
    // 处理退出登录逻辑
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout className={styles.container}>
      <Sider width={280} theme={darkMode ? 'dark' : 'light'}>
        <Sidebar
          conversations={conversations}
          activeKey={activeKey}
          onActiveChange={setActiveKey}
          onAddConversation={handleAddConversation}
          onLogout={handleLogout}
        />
      </Sider>
      <Layout>
        <Content>
          <div className={styles.headerExtra}>
            <Space>
              <Button icon={<ShareAltOutlined />} />
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Button icon={<EllipsisOutlined />} />
              </Dropdown>
            </Space>
          </div>
          <ChatArea 
            conversationId={activeKey} 
          />
        </Content>
      </Layout>
    </Layout>
  );
}; 