import { db } from './db'
import type { NewMeme, MemeUpdate } from './types'

export async function listMemes(text: string, cursor: string | null) {
  const query = db
    .selectFrom('memes')
    .select(['id', 'image_url', 'ocr_text', 'created_at'])
    .where('ocr_text', 'ilike', `%${text}%`)
    .orderBy('created_at', 'desc')
    .limit(30);

  if (cursor) {
    query.where('created_at', '<', new Date(cursor));
  }

  const items = await query.execute();
  const lastItem = items[items.length - 1];
  const nextCursor = items.length === 30 && lastItem?.created_at ? lastItem.created_at.toISOString() : null;

  return { items, nextCursor };
}

export async function createMeme(newMeme: NewMeme) {
  await db
    .insertInto('memes')
    .values(newMeme)
    .execute()
}

export async function updateMeme(id: number, memeUpdate: MemeUpdate) {
  await db
    .updateTable('memes')
    .set(memeUpdate)
    .where('id', '=', id)
    .execute()
}

export async function deleteMeme(id: number) {
  await db
    .deleteFrom('memes')
    .where('id', '=', id)
    .execute()
}
