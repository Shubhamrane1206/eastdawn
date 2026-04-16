import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const INITIAL_BADGES = [
  {
    name: 'First Blood',
    description: 'Perfect score on an introductory cybersecurity quiz.',
    tier: 'BRONZE'
  },
  {
    name: 'Network Novice',
    description: 'Initiate and complete your first network security learning module.',
    tier: 'BRONZE'
  },
  {
    name: 'Iron Streak',
    description: 'Maintain a 7-day consecutive login and learning streak.',
    tier: 'SILVER'
  },
  {
    name: 'Code Breaker',
    description: 'Successfully pass a reverse engineering fundamentals module.',
    tier: 'SILVER'
  },
  {
    name: 'Cloud Sentinel',
    description: 'Secure an AWS Identity and Access Management (IAM) lab simulation.',
    tier: 'SILVER'
  },
  {
    name: 'Encryption Architect',
    description: 'Execute and master a high-level asymmetric cryptography module.',
    tier: 'GOLD'
  },
  {
    name: 'Threat Hunter',
    description: 'Complete the entire Threat Intelligence curriculum track.',
    tier: 'GOLD'
  },
  {
    name: 'QA Operative',
    description: 'Provide high-quality sentiment feedback to the AI generation engine.',
    tier: 'GOLD'
  },
  {
    name: 'Master of Zero-Day',
    description: 'Achieve a flawless score on a Master-tier vulnerability assessment lab.',
    tier: 'DIAMOND'
  },
  {
    name: 'The Operator',
    description: 'Initiate and complete an extensive, highly-customized AI curriculum end-to-end.',
    tier: 'DIAMOND'
  }
];

async function main() {
  console.log('Initiating database badge seeding...')
  
  for (const badge of INITIAL_BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  }

  console.log('Successfully seeded 10 Gamification Badges.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
