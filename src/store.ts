import { proxy } from 'valtio'
import * as queries from '@/lib/queries'
import { likeMeme, unlikeMeme, type FilterType } from '@/lib/queries'
import { authClient } from '@/lib/auth-client'
import { ClientMeme } from './lib/types'

export const store = proxy({
  query: '',
  filter: 'all' as FilterType,
  uploading: false,
  uploadFile: null as File | null,
  uploadText: '',
  activeMeme: null as ClientMeme | null,
  memes: [] as ClientMeme[],
});

// Helper functions to work with memes
export function getMemeById(id: number) {
  return store.memes.find(m => m.id === id)
}

export function getLikedMemes() {
  return store.memes.filter(m => m.is_liked)
}

export function updateMeme(memeId: number, updates: Partial<ClientMeme>) {
  const meme = store.memes.find(m => m.id === memeId)
  if (meme) {
    Object.assign(meme, updates)
  }
}

export async function upload(file: File, ocr: string) {
  store.uploading = true;
  try {
    const session = await authClient.getSession()
    const arrayBuffer = await file.arrayBuffer();
    await queries.createMeme(
      new Uint8Array(arrayBuffer),
      ocr,
      session.data?.user?.id
    );
    // Refresh the list after upload
  } finally {
    store.uploading = false;
  }
}

/* export function selectAllMemes() {
  return store.pages.flatMap((p) => p.items)
}

export function findMeme(memeId: number) {
  return store.pages.flatMap(page => page.items).find(m => m.id === memeId);
} */

export async function toggleLike(id: number, isLiking: boolean) {
  const { data: session } = await authClient.getSession();
  if (!session?.user) {
    await authClient.signIn.social({ provider: "github" });
    return;
  }
  try {
    if (isLiking) {
      await likeMeme(id, session.user.id);
    } else {
      await unlikeMeme(id, session.user.id);
    }
  } catch (err: any) {
    throw err;
  }
}