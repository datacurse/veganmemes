"use client";

import { useState } from "react";
import { Download, Copy, Heart } from "lucide-react";

import { store } from "@/store";

import { Button } from "@/components/ui/button";
// We no longer render the dialog here, so remove the import
// import { MemeDialog } from "./MemeDialog"; 
import { useCopyImage, useDownloadImage } from "@/hooks";
import { ClientMeme } from "@/lib/types";

export function MemeCard({ meme }: { meme: ClientMeme }) {
  const copy = useCopyImage(meme);
  const download = useDownloadImage(meme);

  const [isLiked, setIsLiked] = useState(meme.is_liked);
  const [likeCount, setLikeCount] = useState(meme.like_count);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      setLikeCount((prevCount) => prevCount + 1);
    } else {
      setLikeCount((prevCount) => prevCount - 1);
    }
  };

  const handleCardClick = () => {
    // Set the active meme and then show the dialog
    store.activeMeme = meme;
    store.memeDialog = true;
  };

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl bg-muted transition-shadow hover:shadow-lg hover:shadow-black/10 cursor-pointer"
        onClick={handleCardClick} // Use the new handler
      >
        <img
          src={`data:image/png;base64,${meme.image_data}`}
          alt={meme.ocr_text.slice(0, 100)}
          className="w-full h-auto"
          loading="lazy"
        />

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          {/* ... (Copy, Download, and Like buttons remain the same) ... */}
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
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <span className="text-xs text-white">{likeCount}</span>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleLikeClick}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
              />
            </Button>
          </div>
        </div>
      </div>
      {/* DO NOT render the dialog here anymore */}
      {/* <MemeDialog meme={meme} /> */}
    </>
  );
}