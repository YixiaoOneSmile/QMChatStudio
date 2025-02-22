import { up as addRoleToMessages } from './migrations/003_add_role_to_messages';

async function migrate() {
  try {
    await addRoleToMessages();
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  process.exit();
}

migrate(); 