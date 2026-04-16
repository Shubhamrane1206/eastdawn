import { defineConfig, env } from 'prisma/config'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})

