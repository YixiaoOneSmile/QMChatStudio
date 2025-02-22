import { pool } from '../../config/database';

export async function up() {
  try {
    await pool.execute(`
      ALTER TABLE messages 
      ADD COLUMN role ENUM('local', 'ai') DEFAULT 'local'
    `);
    console.log('✅ Added role column to messages table');
  } catch (error) {
    console.error('❌ Error adding role column:', error);
    throw error;
  }
}

export async function down() {
  try {
    await pool.execute(`
      ALTER TABLE messages 
      DROP COLUMN role
    `);
    console.log('✅ Removed role column from messages table');
  } catch (error) {
    console.error('❌ Error removing role column:', error);
    throw error;
  }
} 