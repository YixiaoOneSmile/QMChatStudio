import { UserDao } from '../dao/userDao';
import { UserDTO } from '../types/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  async register(userDTO: UserDTO) {
    if (!userDTO.username || !userDTO.password) {
      throw new Error('用户名和密码不能为空');
    }

    if (userDTO.username.length < 3) {
      throw new Error('用户名长度不能小于3个字符');
    }

    if (userDTO.password.length < 6) {
      throw new Error('密码长度不能小于6个字符');
    }

    const existingUser = await this.userDao.findByUsername(userDTO.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(userDTO.password, 10);
    const user = await this.userDao.createUser({
      ...userDTO,
      password: hashedPassword
    });

    return {
      id: user.id,
      username: user.username
    };
  }

  async login(userDTO: UserDTO) {
    const user = await this.userDao.findByUsername(userDTO.username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(userDTO.password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }

  async getAllUsers() {
    const users = await this.userDao.findAll();
    return users.map(user => ({
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  }

  async deleteUser(id: number) {
    const user = await this.userDao.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }
    await this.userDao.deleteUser(id);
  }
} 