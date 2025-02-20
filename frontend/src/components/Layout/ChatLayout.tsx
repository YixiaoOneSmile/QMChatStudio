import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Button, Space, Dropdown, Layout, theme } from 'antd';
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
import { 
  addConversation, 
  setActiveConversation 
} from '../../store/slices/conversationsSlice';

const { Sider, Content } = Layout;

export const ChatLayout: React.FC = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector(
    (state: RootState) => state.conversations
  );
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { token } = theme.useToken();
  const isDarkMode = token.colorBgContainer === '#141414';

  const handleAddConversation = () => {
    dispatch(addConversation({
      title: `新对话 ${conversations.length}`,
    }));
  };

  const handleConversationChange = (key: string) => {
    dispatch(setActiveConversation(key));
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

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--sidebar-bg', 'rgba(0, 0, 0, 1)');
      root.style.setProperty('--content-bg', 'rgba(14, 14, 14, 1)');
    } else {
      root.style.setProperty('--sidebar-bg', 'rgba(0, 0, 0, 0.02)');
      root.style.setProperty('--content-bg', '#ffffff');
      root.style.setProperty('--text-color', token.colorText);
      root.style.setProperty('--border-color', token.colorBorder);
    }
  }, [isDarkMode, token]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout className={styles.container}>
      <Sider width={280} theme={darkMode ? 'dark' : 'light'}>
        <Sidebar
          conversations={conversations.map(conv => ({
            key: conv.id,
            label: conv.title,
          }))}
          activeKey={activeConversationId || ''}
          onActiveChange={handleConversationChange}
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
            conversationId={activeConversationId || ''} 
          />
        </Content>
      </Layout>
    </Layout>
  );
}; 