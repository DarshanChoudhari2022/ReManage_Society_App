import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const schemaPath = 'prisma/schema.prisma'
const migrationsPath = 'prisma/migrations'

export default defineConfig({
  schema: schemaPath,
  migrations: { path: migrationsPath },
  datasource: {
    url: process.env.DIRECT_URL ? env('DIRECT_URL') : 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
})
