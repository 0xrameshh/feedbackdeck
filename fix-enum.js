const { Client } = require('pg');
require('dotenv').config();

async function fixEnum() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('🔧 Fixing enum conflict...');
    
    // First, update any super_admin values to admin
    await client.query(`UPDATE "user" SET system_role = 'admin' WHERE system_role = 'super_admin';`);
    console.log('✅ Updated super_admin users to admin');
    
    // Drop the old enum and recreate it with CASCADE
    await client.query(`
      ALTER TABLE "user" ALTER COLUMN system_role TYPE TEXT;
      DROP TYPE system_role CASCADE;
      CREATE TYPE system_role AS ENUM ('user', 'admin');
      ALTER TABLE "user" ALTER COLUMN system_role TYPE system_role USING system_role::system_role;
      ALTER TABLE "user" ALTER COLUMN system_role SET DEFAULT 'user';
    `);
    
    console.log('✅ Fixed enum type');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixEnum();