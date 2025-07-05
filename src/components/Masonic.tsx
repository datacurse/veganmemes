import { useEffect, useState, useMemo, useCallback } from "react";
import { Masonry, useInfiniteLoader } from "masonic";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { authClient } from "@/lib/auth-client";
import * as queries from "@/lib/queries";
import { MemeCard } from "./MemeCard";
import { ClientMeme } from "@/lib/types";

export function Masonic() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <MasonicContent />;
}

function MasonicContent() {
  const snap = useSnapshot(store);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["memes", snap.submittedQuery, snap.filter],
    queryFn: async ({ pageParam = 1 }) => {
      const session = await authClient.getSession();
      return queries.listMemes(
        snap.submittedQuery,
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
  if (memes.length === 0 && !isFetchingNextPage) return <NoMemesMessage />;

  const masonryKey = `${snap.submittedQuery}-${snap.filter}`;

  return (
    <div>
      <Masonry
        key={masonryKey}
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
      {!hasNextPage && memes.length > 0 && <EndOfFeedMessage />}
    </div>
  );
}

// --- NEW STYLED COMPONENTS ---

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col justify-center items-center h-64 text-center">
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <svg
          className="animate-spin h-5 w-5 text-gray-800 dark:text-gray-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-lg">{message}</span>
      </div>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="flex justify-center items-center h-64 p-4">
      <div className="w-full max-w-md p-6 rounded-lg border border-red-500/50 bg-red-500/10 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-red-600 dark:text-red-500">
          Oops! Something went wrong.
        </h3>
        <p className="mt-2 text-sm text-red-600/80 dark:text-red-500/80">
          We couldn't load the memes. Please try again later.
        </p>
      </div>
    </div>
  );
}

function NoMemesMessage() {
  return (
    <div className="flex justify-center items-center h-64 p-4">
      <div className="w-full max-w-md p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
          No Memes Found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your search didn't return any results. Try a different query!
        </p>
      </div>
    </div>
  );
}

function EndOfFeedMessage() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
        <span className="h-px w-16 bg-gray-200 dark:bg-gray-700"></span>
        <span className="text-sm font-medium">You've reached the end</span>
        <span className="h-px w-16 bg-gray-200 dark:bg-gray-700"></span>
      </div>
    </div>
  );
}

function renderItem({
  index,
  data: meme,
  width,
}: {
  index: number;
  data: ClientMeme;
  width: number;
}) {
  return <MemeCard meme={meme} />;
}