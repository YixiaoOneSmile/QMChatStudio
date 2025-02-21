import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Card, Row, Col, Typography,  } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../store/slices/userSlice';
import styles from './Login.module.css';
import loginDecoration from '../../assets/images/login-decoration.svg';

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