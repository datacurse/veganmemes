"use client";

import { Download, Copy, Heart } from "lucide-react";

import { store, toggleLike } from "@/store";

import { Button } from "@/components/ui/button";
import { MemeDialog } from "./MemeDialog";
import { useCopyImage, useDownloadImage } from "@/hooks";
import { ClientMeme } from "@/lib/types";

export function MemeCard({ meme }: { meme: ClientMeme }) {
  const copy = useCopyImage(meme);
  const download = useDownloadImage(meme);
  const like = () => toggleLike(meme)

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl bg-muted transition-shadow hover:shadow-lg hover:shadow-black/10 cursor-pointer"
        onClick={() => store.memeDialog = true}
      >
        <img
          src={`data:image/png;base64,${meme.image_data}`}
          alt={meme.ocr_text.slice(0, 100)}
          className="w-full h-auto"
          loading="lazy"
        />

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          {/* Copy + Download */}
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                copy();
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                download();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Like */}
          <div className="flex items-center gap-1">
            {meme.like_count > 0 && <span className="text-xs text-white">{meme.like_count}</span>}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={like}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${meme.is_liked ? "fill-red-500 text-red-500" : ""
                  }`}
              />
            </Button>
          </div>
        </div>
      </div>
      <MemeDialog meme={meme} />
    </>
  );
}
