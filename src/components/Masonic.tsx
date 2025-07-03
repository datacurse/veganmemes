import { useEffect, useState, useMemo, useCallback } from 'react';
import { Masonry, useInfiniteLoader } from 'masonic';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import { store } from '@/store';
import { authClient } from '@/lib/auth-client';
import * as queries from '@/lib/queries';
import { MemeCard } from './MemeCard';
import { ClientMeme } from '@/lib/types';

export function Masonic() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <MasonryContent />;
}

function MasonryContent() {
  const snap = useSnapshot(store);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['memes', snap.query, snap.filter],
    queryFn: async ({ pageParam = 1 }) => {
      const session = await authClient.getSession();
      return queries.listMemes(
        snap.query,
        pageParam,
        snap.filter,
        session.data?.user?.id
      );
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const memes = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages]
  );

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const maybeLoadMore = useInfiniteLoader(loadMore, {
    isItemLoaded: (index) => index < memes.length,
    threshold: 10,
    minimumBatchSize: 20,
    totalItems: hasNextPage ? memes.length + 1 : memes.length,
  });

  if (isLoading) return <LoadingMessage message="Loading memes..." />;
  if (isError) return <ErrorMessage />;
  if (memes.length === 0) return <NoMemesMessage />;

  return (
    <div>
      <Masonry
        items={memes}
        render={renderItem}
        columnGutter={16}
        columnWidth={240}
        maxColumnCount={4}
        itemHeightEstimate={400}
        overscanBy={2}
        onRender={maybeLoadMore}
        itemKey={(meme) => meme.id}
      />
      {isFetchingNextPage && (
        <div className="mt-4">
          <LoadingMessage message="Loading more memes..." />
        </div>
      )}
    </div>
  );
}

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">{message}</div>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-red-500">Error loading memes</div>
    </div>
  );
}

function NoMemesMessage() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-500">No memes found</div>
    </div>
  );
}

function renderItem({ index, data: meme, width }: { index: number; data: ClientMeme; width: number; }) {
  return <MemeCard meme={meme} />;
}
