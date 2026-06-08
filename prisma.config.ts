import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const schemaPath = 'prisma/schema.prisma'
const migrationsPath = 'prisma/migrations'

export default defineConfig({
  schema: schemaPath,
  migrations: { path: migrationsPath },
  datasource: {
    url: env('DIRECT_URL'),
  },
})
