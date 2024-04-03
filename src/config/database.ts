import { env } from 'process';

const databasePath = env.DATABASE_PATH ?? 'var/database.db';

export { databasePath };
