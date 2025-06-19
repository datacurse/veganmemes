"use client";

import { useSnapshot } from "valtio";
import { store, selectAllMemes, search, loadMore } from "@/store";
import { useEffect, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { UploadDialog } from "@/components/UploadDialog";
import { MasonryGrid } from "@/components/MasonryGrid";

export default function HomePage() {
  const snap = useSnapshot(store);
  const memes = selectAllMemes();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load first page on mount
  useEffect(() => {
    if (store.pages.length === 0) search();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !snap.loading && !snap.uploading) {
        loadMore();
      }
    });

    io.observe(el);
    return () => io.disconnect();
  }, [snap.loading, snap.uploading]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <SearchBar />
          <UploadDialog />
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MasonryGrid memes={memes} />
      </div>

      {snap.loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading more memes...
          </div>
        </div>
      )}

      {snap.pages.at(-1)?.nextCursor && !snap.uploading && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}