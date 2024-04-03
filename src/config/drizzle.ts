import { databasePath } from 'app:config/database';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  driver: 'better-sqlite',
  dbCredentials: { url: databasePath },
  schema: 'src/database/schema.ts',
  out: 'src/database/migrations',
});
