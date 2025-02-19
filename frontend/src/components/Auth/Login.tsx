import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Card, Row, Col, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Welcome } from '@ant-design/x';
import { login } from '../../store/slices/userSlice';
import styles from './Login.module.css';

const { Title } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginForm) => {
    try {
      dispatch(login({ 
        id: '1', 
        name: values.username,
      }));
      message.success('登录成功！');
      navigate('/');
    } catch (error) {
      message.error('登录失败，请重试');
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Row>
          <Col span={12} className={styles.leftSide}>
            <Space direction="vertical" size={24} className={styles.welcomeArea}>
              <Welcome
                variant="borderless"
                icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                title="Hello, I'm QMChatStudio"
                description="Base on Ant Design, AGI product interface solution, create a better intelligent vision"
              />
              <div className={styles.features}>
                <Button type="text" icon={<UserOutlined />}>What's new in X?</Button>
                <Button type="text" icon={<LockOutlined />}>What's AGI?</Button>
                <Button type="text" icon={<UserOutlined />}>Where is the doc?</Button>
              </div>
            </Space>
          </Col>
          <Col span={12} className={styles.rightSide}>
            <div className={styles.formContainer}>
              <Title level={2}>欢迎使用</Title>
              <Title level={4} type="secondary" style={{ marginBottom: 40 }}>
                QMChatStudio
              </Title>
              <Form
                form={form}
                name="login"
                onFinish={handleSubmit}
                size="large"
                layout="vertical"
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="用户名" 
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}; 