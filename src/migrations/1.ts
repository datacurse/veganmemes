import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('memes')
    .addColumn('id', 'bigserial', (c) => c.primaryKey())
    .addColumn('image_type', 'text', (c) => c.notNull())
    .addColumn('image_data', 'bytea', (c) => c.notNull())
    .addColumn('ocr_text', 'text', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`now()`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('memes').execute();
}
