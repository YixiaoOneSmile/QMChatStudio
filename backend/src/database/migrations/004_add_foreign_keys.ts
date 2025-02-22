import { pool } from '../config/database';

export async function up() {
  try {
    await pool.execute(`
      ALTER TABLE messages 
      ADD CONSTRAINT fk_conversation_messages 
      FOREIGN KEY (conversation_id) 
      REFERENCES conversations(id)
      ON DELETE CASCADE
    `);
    console.log('✅ Added foreign key constraint to messages table');
  } catch (error) {
    console.error('❌ Error adding foreign key:', error);
    throw error;
  }
}

export async function down() {
  try {
    await pool.execute(`
      ALTER TABLE messages 
      DROP FOREIGN KEY fk_conversation_messages
    `);
    console.log('✅ Removed foreign key constraint from messages table');
  } catch (error) {
    console.error('❌ Error removing foreign key:', error);
    throw error;
  }
} 