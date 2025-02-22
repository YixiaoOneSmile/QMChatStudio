import request from 'supertest';
import { pool } from '../config/database';
import { UserService } from '../services/userService';
import express from 'express';
import { UserDao } from '../dao/userDao';

// 创建一个测试用的 express 应用
const app = express();
app.use(express.json());

// 初始化服务
const userService = new UserService();

// 注册路由
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await userService.register({ username, password });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

describe('User Registration', () => {
  // 在所有测试开始前清理测试数据
  beforeAll(async () => {
    await pool.execute('DELETE FROM users WHERE username LIKE ?', ['test_user%']);
  });

  // 在所有测试结束后清理测试数据并关闭数据库连接
  afterAll(async () => {
    await pool.execute('DELETE FROM users WHERE username LIKE ?', ['test_user%']);
    await pool.end();
  });

  it('should successfully register a new user', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        username: 'test_user_1',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username', 'test_user_1');
    expect(response.body).not.toHaveProperty('password'); // 确保不返回密码
  });

  it('should not allow duplicate usernames', async () => {
    // 第一次注册
    await request(app)
      .post('/api/register')
      .send({
        username: 'test_user_2',
        password: 'password123'
      });

    // 尝试使用相同用户名再次注册
    const response = await request(app)
      .post('/api/register')
      .send({
        username: 'test_user_2',
        password: 'different_password'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', '用户名已存在');
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        username: '',
        password: ''
      });

    expect(response.status).toBe(400);
  });

  it('should hash the password before saving', async () => {
    const username = 'test_user_3';
    const password = 'password123';

    // 注册用户
    await request(app)
      .post('/api/register')
      .send({ username, password });

    // 直接从数据库查询用户
    const userDao = new UserDao();
    const user = await userDao.findByUsername(username);

    expect(user).not.toBeNull();
    expect(user?.password).not.toBe(password); // 密码应该被加密
    expect(user?.password.startsWith('$2b$')).toBe(true); // bcrypt 加密的特征
  });
}); 