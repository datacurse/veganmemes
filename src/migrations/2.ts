import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('memes')
    .dropColumn('image_type')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('memes')
    .addColumn('image_type', 'text', (c) =>
      c.notNull().defaultTo('image/png')
    )
    .execute()
}
