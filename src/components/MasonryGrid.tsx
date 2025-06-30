"use client";

import { useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { authClient } from "@/lib/auth-client";
import * as queries from "@/lib/queries";
import { MemeCard } from "./MemeCard";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { ClientMeme } from "@/lib/types";

export function MasonryGrid() {
  const snap = useSnapshot(store);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['memes', snap.query, snap.filter],
    queryFn: async ({ pageParam }) => {
      const session = await authClient.getSession();
      const data = queries.listMemes(
        snap.query,
        pageParam,
        snap.filter,
        session.data?.user?.id
      );
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get all memes from pages
  const allMemes = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );

  // Responsive columns with masonry distribution
  const { width } = useWindowSize();
  const columns = useMemo(() => {
    // const columnCount = width < 640 ? 2 : width < 768 ? 3 : width < 1024 ? 4 : 4;
    const columnCount = 2

    if (allMemes.length === 0) return Array(columnCount).fill([] as ClientMeme[]);

    const cols: ClientMeme[][] = Array.from({ length: columnCount }, () => []);
    const heights = new Array(columnCount).fill(0);

    allMemes.forEach((meme) => {
      const shortestColumn = heights.indexOf(Math.min(...heights));
      cols[shortestColumn]!.push(meme);
      heights[shortestColumn] += 250 + Math.random() * 200;
    });

    return cols;
  }, [allMemes, width]);

  return (
    <>
      <div className="flex gap-4" style={{ minHeight: "200px" }}>
        {columns.map((col, i) => (
          <div key={i} className="flex-1 flex flex-col gap-4">
            {col.map((meme) => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </div>
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading more memes…
          </div>
        </div>
      )}

      {hasNextPage && <div ref={sentinelRef} className="h-10" />}   </>
  );
}