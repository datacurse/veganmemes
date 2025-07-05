import { proxy } from 'valtio'
import * as queries from '@/lib/queries'
import { likeMeme, unlikeMeme, type FilterType } from '@/lib/queries'
import { authClient } from '@/lib/auth-client'
import { ClientMeme } from './lib/types'
import { queryClient } from '@/lib/query-client'

export const store = proxy({
  query: '',
  submittedQuery: '',
  filter: 'all' as FilterType,
  uploading: false,
  uploadFile: null as File | null,
  uploadText: '',
  activeMeme: null as ClientMeme | null,
});

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
    await queryClient.invalidateQueries({ queryKey: ['memes'] })
  } finally {
    store.uploading = false;
  }
}

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