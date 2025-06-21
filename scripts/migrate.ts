import 'dotenv/config';  // Add this line at the very top
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import {
  Kysely,
  Migrator,
  PostgresDialect,
} from 'kysely';
import type { DB } from '../src/lib/types';
import { WinFileMigrationProvider } from './WinFileMigrationProvider';

// --- ESM-safe dirname ------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---------------------------------------------------------

async function migrateToLatest() {
  // You might want to add a check here
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new WinFileMigrationProvider(path.join(__dirname, '../src/migrations')),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((r) =>
    console.log(
      `${r.status === 'Success' ? '✅' : '❌'}  ${r.migrationName}`,
    ),
  );

  if (error) {
    console.error('❌  migration failed');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();