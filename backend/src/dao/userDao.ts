import { pool } from '../config/database';
import { User, UserDTO } from '../types/user';

export class UserDao {
  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return (rows as User[])[0] || null;
  }

  async createUser(userDTO: UserDTO): Promise<User> {
    const [result] = await pool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [userDTO.username, userDTO.password]
    );
    const id = (result as any).insertId;
    const user = await this.findById(id);
    if (!user) {
      throw new Error('创建用户失败');
    }
    return user;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return (rows as User[])[0] || null;
  }

  async findAll(): Promise<User[]> {
    const [rows] = await pool.execute('SELECT * FROM users');
    return rows as User[];
  }

  async deleteUser(id: number): Promise<void> {
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
  }
} 