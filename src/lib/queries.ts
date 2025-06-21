"use server"
import { db } from './db'
import sharp from 'sharp'
import { ClientMeme } from './types';

export async function listMemes(text: string, cursor: string | null) {
  const query = db
    .selectFrom('memes')
    .select(['id', 'image_data', 'ocr_text', 'created_at'])
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

export async function createMeme(imageBuffer: Buffer, ocrText: string) {
  const pngBuffer = await sharp(imageBuffer)
    .png()
    .toBuffer();
  await db
    .insertInto('memes')
    .values({
      image_data: pngBuffer,
      ocr_text: ocrText
    })
    .execute()
}
