import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import * as createDefaultUser from './seeds/001_create_default_user';

// 获取所有迁移文件并按序号排序
async function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.promises.readdir(migrationsDir);
  return files
    .filter(file => file.endsWith('.ts'))
    .sort((a, b) => {
      const numA = parseInt(a.split('_')[0]);
      const numB = parseInt(b.split('_')[0]);
      return numA - numB;
    });
}

async function migrate() {
  console.log('🚀 Running migrations...');
  try {
    const migrationFiles = await getMigrationFiles();
    
    for (const file of migrationFiles) {
      const migration = require(path.join(__dirname, 'migrations', file));
      const migrationName = file.replace('.ts', '');
      
      console.log(`Running migration: ${migrationName}`);
      await migration.up();
    }
    
    console.log('✨ All migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function seed() {
  console.log('🌱 Running seeds...');
  await createDefaultUser.seed();
  console.log('✨ All seeds completed');
}

async function rollback() {
  console.log('⏪ Rolling back migrations...');
  try {
    const migrationFiles = await getMigrationFiles();
    
    // 反转数组以便从后往前回滚
    for (const file of migrationFiles.reverse()) {
      const migration = require(path.join(__dirname, 'migrations', file));
      const migrationName = file.replace('.ts', '');
      
      console.log(`Rolling back: ${migrationName}`);
      await migration.down();
    }
    
    console.log('✨ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
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