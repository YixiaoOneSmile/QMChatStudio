import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Card, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginAsync } from '../../store/slices/userSlice';
import type { RootState, AppDispatch } from '../../store';
import styles from './Login.module.css';
import loginDecoration from '../../assets/images/login-decoration.svg';

const { Title } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const loginStatus = useSelector((state: RootState) => state.user.status);
  const loginError = useSelector((state: RootState) => state.user.error);

  const handleSubmit = async (values: LoginForm) => {
    try {
      await dispatch(loginAsync(values)).unwrap();
      message.success('登录成功！');
      navigate('/');
    } catch (error) {
      message.error(loginError || '登录失败，请重试');
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Row>
          <Col span={12} className={styles.leftSide}>
            <img 
              src={loginDecoration} 
              alt="Login decoration" 
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </Col>
          <Col span={12} className={styles.rightSide}>
            <div className={styles.formContainer}>
              <Title level={2}>QMChatStudio</Title>
              <Title level={5} type="secondary" style={{ marginBottom: 40 }}>
                极简、美观的Chat解决方案
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
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="用户名" 
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                  />
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block
                    loading={loginStatus === 'loading'}
                  >
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