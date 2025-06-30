import { useEffect, useState, useMemo } from 'react';
import { Masonry, useInfiniteLoader } from "masonic";
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import { store } from '@/store';
import { authClient } from '@/lib/auth-client';
import * as queries from "@/lib/queries";
import { MemeCard } from './MemeCard';
import { ClientMeme } from '@/lib/types';

const MasonicWrapper = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return <MasonryContent />;
};

const MasonryContent = () => {
  const snap = useSnapshot(store);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ['memes', snap.query, snap.filter],
    queryFn: async ({ pageParam }) => {
      const session = await authClient.getSession();
      return queries.listMemes(snap.query, pageParam, snap.filter, session.data?.user?.id);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const memes = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data?.pages]);

  const maybeLoadMore = useInfiniteLoader(
    async () => {
      if (hasNextPage && !isFetchingNextPage) await fetchNextPage();
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      threshold: 10,
      minimumBatchSize: 20,
      totalItems: hasNextPage ? 9999999 : memes.length,
    }
  );

  if (isLoading) return <LoadingMessage message="Loading memes..." />;
  if (error) return <ErrorMessage />;
  if (!memes.length) return <NoMemesMessage />;

  return (
    <div>
      <Masonry
        items={memes}
        render={MasonryMemeCard}
        columnGutter={16}
        columnWidth={300}
        maxColumnCount={6}
        itemHeightEstimate={400}
        overscanBy={2}
        onRender={maybeLoadMore}
        itemKey={(meme) => meme.id}
      />
      {isFetchingNextPage && <LoadingMessage message="Loading more memes..." />}
    </div>
  );
};

const LoadingMessage = ({ message }) => (
  <div className="flex justify-center items-center h-64">
    <div className="text-lg">{message}</div>
  </div>
);

const ErrorMessage = () => (
  <div className="flex justify-center items-center h-64">
    <div className="text-lg text-red-500">Error loading memes</div>
  </div>
);

const NoMemesMessage = () => (
  <div className="flex justify-center items-center h-64">
    <div className="text-lg text-gray-500">No memes found</div>
  </div>
);

function MasonryMemeCard({ index, data, width }: { index: number, data: ClientMeme, width: number }) {
  // Add a return statement here to return the JSX
  return (
    <div>
      <MemeCard meme={data} />
    </div>
  );
};

export default MasonicWrapper;