"use server"
import { Kysely, PostgresDialect, sql } from 'kysely'
import pg from 'pg'
import type { DB } from './types';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
})

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool })
})

await db.schema
  .createTable('memes')
  .ifNotExists()
  .addColumn('id', 'bigserial', col => col.primaryKey())  // auto-increments
  .addColumn('image_url', 'text', col => col.notNull())
  .addColumn('ocr_text', 'text', col => col.notNull())
  .addColumn('uploader_id', 'text')
  .addColumn('created_at', 'timestamptz',
    col => col.defaultTo(sql`now()`).notNull())
  .execute()

export async function closeDb() {
  await db.destroy()
}
