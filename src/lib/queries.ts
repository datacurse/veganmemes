"use server"
import { db } from './db'
import type { NewMeme, MemeUpdate } from './types'

export interface ClientMeme {
  id: number
  image_type: string
  image_data: string
  ocr_text: string
  created_at: Date
}

export async function listMemes(text: string, cursor: string | null) {
  const query = db
    .selectFrom('memes')
    .select(['id', 'image_type', 'image_data', 'ocr_text', 'created_at'])
    .where('ocr_text', 'ilike', `%${text}%`)
    .orderBy('created_at', 'desc')
    .limit(30);

  if (cursor) {
    query.where('created_at', '<', new Date(cursor));
  }

  const items = await query.execute();
  const clientItems: ClientMeme[] = items.map(item => ({
    ...item,
    image_data: Buffer.from(item.image_data).toString('base64')
  }));

  const lastItem = items[items.length - 1];
  const nextCursor = items.length === 30 && lastItem?.created_at ? lastItem.created_at.toISOString() : null;

  return { items: clientItems, nextCursor };
}

export async function createMeme(newMeme: NewMeme) {
  const imageData = newMeme.image_data instanceof Uint8Array
    ? Buffer.from(newMeme.image_data)
    : newMeme.image_data;

  await db
    .insertInto('memes')
    .values({
      ...newMeme,
      image_data: imageData
    })
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
