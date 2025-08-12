import { db } from '@/db'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'

async function promoteToAdmin() {
  try {
    // Get the first user (you) and promote to super_admin
    const users = await db.select().from(user).limit(1)
    
    if (users.length === 0) {
      console.log('No users found')
      return
    }

    const firstUser = users[0]
    
    await db
      .update(user)
      .set({ 
        systemRole: 'admin',
        updatedAt: new Date()
      })
      .where(eq(user.id, firstUser.id))
    
    console.log(`Promoted user ${firstUser.email} to admin`)
  } catch (error) {
    console.error('Error promoting user:', error)
  }
}

promoteToAdmin()