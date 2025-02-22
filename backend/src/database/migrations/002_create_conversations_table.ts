import { pool } from '../../config/database';

export async function up() {
  const createConversationsTable = `
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR(255) PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      conversation_id VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('local', 'loading', 'success') DEFAULT 'success',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `;

  try {
    await pool.execute(createConversationsTable);
    console.log('✅ Conversations table created successfully');
    await pool.execute(createMessagesTable);
    console.log('✅ Messages table created successfully');
  } catch (error) {
    console.error('❌ Error creating conversations and messages tables:', error);
    throw error;
  }
}

export async function down() {
  const dropMessagesTable = `DROP TABLE IF EXISTS messages;`;
  const dropConversationsTable = `DROP TABLE IF EXISTS conversations;`;
  
  try {
    await pool.execute(dropMessagesTable);
    console.log('✅ Messages table dropped successfully');
    await pool.execute(dropConversationsTable);
    console.log('✅ Conversations table dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
} 