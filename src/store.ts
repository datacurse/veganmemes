import { proxy } from 'valtio';
import * as queries from '@/lib/queries';
import type { Meme, NewMeme } from '@/lib/types';

interface Page {
  items: Meme[];
  nextCursor: string | null;
}

export const store = proxy({
  query: '',
  pages: [] as Page[],
  loading: false,

  showUploader: false,
  uploading: false,

  user: null as { id: string; name: string } | null,

  async search() {
    store.loading = true;
    const { items, nextCursor } = await queries.listMemes(store.query, null);
    store.pages = [{ items, nextCursor }];
    store.loading = false;
  },

  async loadMore() {
    const last = store.pages.at(-1);
    if (!last?.nextCursor) return;
    store.loading = true;
    const { items, nextCursor } = await queries.listMemes(
      store.query,
      last.nextCursor,
    );
    store.pages.push({ items, nextCursor });
    store.loading = false;
  },

  async upload(url: string, ocr: string) {
    if (!store.user) throw new Error('not signed in');
    store.uploading = true;

    const optimistic: NewMeme = {
      image_url: url,
      ocr_text: ocr,
    };
    store.pages.unshift({ items: [optimistic], nextCursor: null });

    try {
      await queries.createMeme(optimistic);
      await store.search();
    } finally {
      store.uploading = false;
    }
  },
});

export function selectAllMemes() {
  return store.pages.flatMap(p => p.items);
}
