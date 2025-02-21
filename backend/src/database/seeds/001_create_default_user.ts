import { UserService } from '../../services/userService';

export async function seed() {
  const userService = new UserService();
  
  try {
    await userService.register({
      username: 'admin',
      password: '123456'
    });
    console.log('✅ Default admin user created successfully');
  } catch (error) {
    // 如果用户已存在，我们不认为这是一个错误
    if (error instanceof Error && error.message === '用户名已存在') {
      console.log('ℹ️ Default admin user already exists');
      return;
    }
    console.error('❌ Error creating default admin user:', error);
    throw error;
  }
} 