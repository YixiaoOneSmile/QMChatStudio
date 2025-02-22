import * as createUsersTable from './migrations/001_create_users_table';
import * as createConversationsTable from './migrations/002_create_conversations_table';
import * as createDefaultUser from './seeds/001_create_default_user';
import { pool } from '../config/database';

async function migrate() {
  console.log('🚀 Running migrations...');
  await createUsersTable.up();
  await createConversationsTable.up();
  console.log('✨ All migrations completed');
}

async function seed() {
  console.log('🌱 Running seeds...');
  await createDefaultUser.seed();
  console.log('✨ All seeds completed');
}

async function rollback() {
  console.log('⏪ Rolling back migrations...');
  await createConversationsTable.down();
  await createUsersTable.down();
  console.log('✨ Rollback completed');
}

async function setup() {
  try {
    await migrate();
    await seed();
    console.log('✨ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

// 根据命令行参数执行不同的操作
const command = process.argv[2];

switch (command) {
  case 'migrate':
    migrate().finally(() => pool.end());
    break;
  case 'seed':
    seed().finally(() => pool.end());
    break;
  case 'rollback':
    rollback().finally(() => pool.end());
    break;
  case 'setup':
    setup();
    break;
  default:
    console.log(`
Available commands:
  npm run db:migrate  - Run all migrations
  npm run db:seed    - Run all seeds
  npm run db:rollback - Rollback all migrations
  npm run db:setup   - Run both migrations and seeds
    `);
    pool.end();
} 