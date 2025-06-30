"use server"
import { db } from './db'
import sharp from 'sharp'
import { ClientMeme } from './types';

export type FilterType = "all" | "liked";

export async function listMemes(
  text: string,
  page: number,
  filter: FilterType = "all",
  userId?: string | null
) {
  const cardsPerPage = 10;
  const offset = (page - 1) * cardsPerPage; // Calculate the offset

  let baseQuery = db
    .selectFrom('memes')
    .select([
      'memes.id',
      'memes.image_data',
      'memes.ocr_text',
      'memes.created_at',
      'memes.user_id',
    ])
    // Add like count using a subquery
    .select((eb) => [
      eb.selectFrom('likes')
        .select(eb.fn.count<number>('user_id').as('count'))
        .whereRef('likes.meme_id', '=', 'memes.id')
        .as('like_count')
    ])
    .where('memes.ocr_text', 'ilike', `%${text}%`);

  // Apply filters
  if (filter === 'liked' && userId) {
    baseQuery = baseQuery.where((eb) =>
      eb.exists(
        eb.selectFrom('likes')
          .select('user_id')
          .whereRef('likes.meme_id', '=', 'memes.id')
          .where('likes.user_id', '=', userId)
      )
    );
  }

  // Apply ordering, offset, and limit for pagination
  let query = baseQuery.orderBy('memes.created_at', 'desc').limit(cardsPerPage).offset(offset);

  const items = await query.execute();

  // Get liked meme IDs for the current user if logged in
  let likedMemeIds = new Set<number>();
  if (userId && items.length > 0) {
    const likedMemes = await db
      .selectFrom('likes')
      .select('meme_id')
      .where('user_id', '=', userId)
      .where('meme_id', 'in', items.map(m => m.id))
      .execute();

    likedMemeIds = new Set(likedMemes.map(l => l.meme_id));
  }

  const clientItems: ClientMeme[] = items.map(item => ({
    id: item.id,
    image_data: Buffer.from(item.image_data).toString('base64'),
    ocr_text: item.ocr_text,
    user_id: item.user_id,
    created_at: item.created_at,
    like_count: Number(item.like_count || 0),
    is_liked: likedMemeIds.has(item.id)
  }));

  const nextPage = items.length === cardsPerPage ? page + 1 : null; // Determine the next page number

  console.log("listMemes");
  return { items: clientItems, nextPage };
}

export async function createMeme(
  imageBuffer: Uint8Array,
  ocrText: string,
  userId?: string | null
) {
  const pngBuffer = await sharp(Buffer.from(imageBuffer))
    .png()
    .toBuffer();

  await db
    .insertInto('memes')
    .values({
      image_data: pngBuffer,
      ocr_text: ocrText,
      user_id: userId || null
    })
    .execute()
}

export async function likeMeme(memeId: number, userId: string) {
  try {
    await db
      .insertInto('likes')
      .values({
        user_id: userId,
        meme_id: memeId
      })
      .execute();
  } catch (error: any) {
    // If it's a unique constraint violation, the user already liked this meme
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      throw new Error("Already liked this meme");
    }
    throw error;
  }
}

export async function unlikeMeme(memeId: number, userId: string) {
  const result = await db
    .deleteFrom('likes')
    .where('user_id', '=', userId)
    .where('meme_id', '=', memeId)
    .executeTakeFirst();

  if (result.numDeletedRows === 0n) {
    throw new Error("Haven't liked this meme");
  }
}