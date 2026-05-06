/**
 * EASTDAWN — Admin Bootstrap Script
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Creates a dedicated admin user via Supabase Admin API
 * and promotes them to ADMIN role in the database.
 */

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

// Load env files
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const ADMIN_EMAIL = 'admin@eastdawn.in'
const ADMIN_PASSWORD = 'EastDawn@Master2026!'
const ADMIN_NAME = 'Shubham Rane'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Use direct URL for scripts to bypass connection pooling
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

const db = new PrismaClient()

async function main() {
  console.log('🚀 EASTDAWN Admin Bootstrap Starting...\n')

  // 1. Create or fetch user in Supabase Auth
  console.log(`Creating auth user: ${ADMIN_EMAIL}`)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  let supabaseUserId: string

  const existing = users.find(u => u.email === ADMIN_EMAIL)

  if (existing) {
    console.log('  ✓ Auth user already exists, updating password...')
    await supabase.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    supabaseUserId = existing.id
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME }
    })
    if (error || !data.user) {
      console.error('  ✗ Failed to create auth user:', error?.message)
      process.exit(1)
    }
    supabaseUserId = data.user.id
    console.log('  ✓ Auth user created:', supabaseUserId)
  }

  // 2. Upsert in Prisma with ADMIN role
  console.log(`\nUpserting database record with ADMIN role...`)
  const dbUser = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'ADMIN',
    },
    update: {
      role: 'ADMIN',
      name: ADMIN_NAME,
    },
  })
  console.log('  ✓ Database record upserted:', dbUser.id)

  console.log('\n✅ Admin bootstrap complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ADMIN CREDENTIALS (KEEP SECRET)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Email    : ${ADMIN_EMAIL}`)
  console.log(`  Password : ${ADMIN_PASSWORD}`)
  console.log(`  URL      : http://localhost:3000/admin`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  await db.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
