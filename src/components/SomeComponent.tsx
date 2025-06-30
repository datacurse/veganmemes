import * as React from "react";
import * as InfiniteGrid from '@egjs/react-infinitegrid';
const { MasonryInfiniteGrid } = InfiniteGrid;
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { authClient } from "@/lib/auth-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MemeCard } from "./MemeCard";
import * as queries from "@/lib/queries";

export default function MemeGrid() {
  const snap = useSnapshot(store);
  const gridRef = React.useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['memes', snap.query, snap.filter],
    queryFn: async ({ pageParam }) => {
      const session = await authClient.getSession();
      const data = await queries.listMemes(
        snap.query,
        pageParam,
        snap.filter,
        session.data?.user?.id
      );
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const allMemes = React.useMemo(() => {
    return data?.pages.flatMap((page, pageIndex) =>
      page.items.map(meme => ({ ...meme, groupKey: pageIndex }))
    ) || [];
  }, [data]);

  // Force grid to recalculate positions when data changes
  React.useEffect(() => {
    if (gridRef.current && allMemes.length > 0) {
      gridRef.current.renderItems();
    }
  }, [allMemes]);

  return (
    <div className="w-full min-h-screen" style={{ position: 'relative' }}>
      <MasonryInfiniteGrid
        ref={gridRef}
        className="w-full"
        gap={5}
        align="justify"
        column={0} // Let it auto-calculate columns
        columnSize={0}
        columnSizeRatio={0}
        isConstantSize={false}
        isEqualSize={false}
        observeChildren={true}
        useTransform={true}
        horizontal={false}
        percentage={false}
        isOverflowScroll={false}
        placeholder={<div className="bg-red-500 w-12 h-12"></div>}
        onRequestAppend={(e) => {
          if (hasNextPage && !isFetchingNextPage) {
            e.wait();
            fetchNextPage().then(() => {
              e.ready();
            });
          }
        }}
        onRenderComplete={(e) => {
          console.log('Render complete', e);
        }}
      >
        {allMemes.map((meme) => (
          <div
            key={meme.id}
            data-grid-groupkey={meme.groupKey}
            className="inline-block"
            style={{ width: '300px' }} // Fixed width for testing
          >
            <MemeCard meme={meme} />
          </div>
        ))}
      </MasonryInfiniteGrid>
    </div>
  );
}