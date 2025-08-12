import { db } from '@/db'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

async function fixDatabaseBeforeMigration() {
  console.log('🔧 Fixing database before migration...')
  
  try {
    // Fix super_admin enum values
    console.log('Converting super_admin users to admin...')
    const result = await db.execute(sql`
      UPDATE "user" 
      SET system_role = 'admin' 
      WHERE system_role = 'super_admin'
    `)
    
    console.log('✅ Super admin users converted to admin')
    
    // Check current role distribution
    const roleCount = await db.execute(sql`
      SELECT system_role, COUNT(*) as count 
      FROM "user" 
      GROUP BY system_role
    `)
    
    console.log('Current user role distribution:')
    console.table(roleCount)
    
    console.log('✅ Database is ready for migration')
    
  } catch (error) {
    console.error('❌ Error fixing database:', error)
    process.exit(1)
  }
}

fixDatabaseBeforeMigration()
  .then(() => {
    console.log('🎉 Database fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Database fix failed:', error)
    process.exit(1)
  })