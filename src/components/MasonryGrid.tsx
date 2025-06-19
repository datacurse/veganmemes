// File: app/components/MasonryGrid.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MemeCard } from "@/components/MemeCard";
import { ClientMeme } from "@/lib/queries";

interface MasonryGridProps {
  memes: ClientMeme[];
}

export function MasonryGrid({ memes }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<ClientMeme[][]>([]);
  const [columnCount, setColumnCount] = useState(4);

  // ── responsive column count ─────────────────────────────
  useEffect(() => {
    function updateColumnCount() {
      const w = window.innerWidth;
      if (w < 640) setColumnCount(2);
      else if (w < 768) setColumnCount(3);
      else if (w < 1024) setColumnCount(4);
      else if (w < 1280) setColumnCount(5);
      else if (w < 1536) setColumnCount(6);
      else setColumnCount(7);
    }

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // ── distribute memes across columns ─────────────────────
  useEffect(() => {
    if (memes.length === 0) {
      setColumns([]);
      return;
    }

    const newColumns: ClientMeme[][] = Array.from({ length: columnCount }, () => []);
    const heights = new Array(columnCount).fill(0);

    memes.forEach((meme) => {
      const i = heights.indexOf(Math.min(...heights));
      newColumns[i]?.push(meme);
      // quick-and-dirty estimated height
      heights[i] += 250 + Math.random() * 200;
    });

    setColumns(newColumns);
  }, [memes, columnCount]);

  return (
    <div ref={containerRef} className="flex gap-4" style={{ minHeight: "200px" }}>
      {columns.map((col, i) => (
        <div key={i} className="flex-1 flex flex-col gap-4">
          {col.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>
      ))}
    </div>
  );
}
