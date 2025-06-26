import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create likes table
  await db.schema
    .createTable('likes')
    .addColumn('user_id', 'text', (c) => c.notNull())
    .addColumn('meme_id', 'integer', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(db.fn('now')).notNull()
    )
    .addPrimaryKeyConstraint('likes_pkey', ['user_id', 'meme_id'])
    .execute()

  // Add foreign key constraints
  await db.schema
    .alterTable('likes')
    .addForeignKeyConstraint(
      'likes_user_id_fkey',
      ['user_id'],
      'user',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute()

  await db.schema
    .alterTable('likes')
    .addForeignKeyConstraint(
      'likes_meme_id_fkey',
      ['meme_id'],
      'memes',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute()

  // Add index for performance
  await db.schema
    .createIndex('likes_meme_id_idx')
    .on('likes')
    .column('meme_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('likes').execute()
}