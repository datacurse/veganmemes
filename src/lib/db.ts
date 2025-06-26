"use server"
import { Kysely, PostgresDialect, sql } from 'kysely'
import pg from 'pg'
import type { DB } from './types';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const INT8_OID = 20   // Postgres OID for int8/bigint
pg.types.setTypeParser(INT8_OID, (v) => parseInt(v, 10))

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
})

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool })
})

export async function closeDb() {
  await db.destroy()
}
