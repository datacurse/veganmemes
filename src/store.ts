import { proxy } from 'valtio'
import * as queries from '@/lib/queries'
import type { FilterType } from '@/lib/queries'
import { authClient } from '@/lib/auth-client'
import { ClientMeme } from './lib/types'

interface Page {
  items: ClientMeme[]
  nextCursor: string | null
}

export const store = proxy({
  query: '',
  filter: 'all' as FilterType,
  pages: [] as Page[],
  loading: false,
  uploading: false,
  uploadFile: null as File | null,
  uploadText: '',
});

export async function search() {
  store.loading = true;
  try {
    const session = await authClient.getSession();   // ⬅️ unwrap
    const { items, nextCursor } = await queries.listMemes(
      store.query,
      null,
      store.filter,
      session.data?.user?.id
    );
    store.pages = [{ items, nextCursor }];
  } finally {
    store.loading = false;
  }
}


export async function loadMore() {
  const last = store.pages.at(-1)
  if (!last?.nextCursor) return
  store.loading = true
  try {
    const session = await authClient.getSession()
    const { items, nextCursor } = await queries.listMemes(
      store.query,
      last.nextCursor,
      store.filter,
      session.data?.user?.id
    )
    store.pages.push({ items, nextCursor })
  } finally {
    store.loading = false
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
    await search();
  } finally {
    store.uploading = false;
  }
}

export function selectAllMemes() {
  return store.pages.flatMap((p) => p.items)
}