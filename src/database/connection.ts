import { databasePath } from 'app:config/database';
import * as schema from 'app:database/schema';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate as migrator } from 'drizzle-orm/bun-sqlite/migrator';
import { resolve } from 'path';

const client = new Database(databasePath);
const database = drizzle(client, { schema });
const migrate = async () =>
  migrator(database, {
    migrationsFolder: resolve(import.meta.dir, 'migrations'),
  });

export { client, database, migrate };
