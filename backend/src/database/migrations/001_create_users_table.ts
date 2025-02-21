import { pool } from '../../config/database';

export async function up() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.execute(createTableSQL);
    console.log('✅ Users table created successfully');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }
}

export async function down() {
  const dropTableSQL = `DROP TABLE IF EXISTS users;`;
  
  try {
    await pool.execute(dropTableSQL);
    console.log('✅ Users table dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping users table:', error);
    throw error;
  }
} 