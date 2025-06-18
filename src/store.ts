import { proxy } from 'valtio'
import * as queries from '@/lib/queries'
import type { ClientMeme } from '@/lib/queries'

interface Page {
  items: ClientMeme[]
  nextCursor: string | null
}

export const store = proxy({
  query: '',
  pages: [] as Page[],
  loading: false,
  uploading: false,
});


export async function search() {
  store.loading = true
  try {
    const { items, nextCursor } = await queries.listMemes(store.query, null)
    store.pages = [{ items, nextCursor }]
  } finally {
    store.loading = false
  }
}

export async function loadMore() {
  const last = store.pages.at(-1)
  if (!last?.nextCursor) return
  store.loading = true
  try {
    const { items, nextCursor } = await queries.listMemes(store.query, last.nextCursor)
    store.pages.push({ items, nextCursor })
  } finally {
    store.loading = false
  }
}

export async function upload(file: File, ocr: string) {
  store.uploading = true;
  try {
    const arrayBuffer = await file.arrayBuffer();
    await queries.createMeme({
      image_type: file.type,
      image_data: new Uint8Array(arrayBuffer),
      ocr_text: ocr.trim(),
    });
  } finally {
    store.uploading = false;
  }
}


export function selectAllMemes() {
  return store.pages.flatMap((p) => p.items)
}
