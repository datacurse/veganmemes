"use client";

import { Download, Copy, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MemeDialog } from "./MemeDialog";
import { toast } from "sonner";
import { ClientMeme } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { likeMeme, unlikeMeme } from "@/lib/queries";

export function MemeCard({ meme }: { meme: ClientMeme }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(meme.is_liked || false);
  console.log(isLiked)
  const [likeCount, setLikeCount] = useState(meme.like_count || 0);
  const { data: session } = authClient.useSession();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${meme.image_data}`;
      link.download = `veganmemes-${meme.id}.png`;
      link.click();
      toast.success("Image downloaded");
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await fetch(`data:image/png;base64,${meme.image_data}`).then(r => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      toast.success("Image copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy image");
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
      await authClient.signIn.social({ provider: "github" });
      return;
    }

    try {
      if (isLiked) {
        await unlikeMeme(meme.id, session.user.id);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeMeme(meme.id, session.user.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.log(err.message)
      // Only show error if it's not an expected error
      if (!err.message?.includes("Already liked this meme") || !err.message?.includes("Haven't liked")) {
        toast.error("Failed to update like");
      }
    }
  };

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl bg-muted transition-shadow hover:shadow-lg hover:shadow-black/10 cursor-pointer"
        onClick={() => setDialogOpen(true)}
      >
        <img
          src={`data:image/png;base64,${meme.image_data}`}
          alt={meme.ocr_text.slice(0, 100)}
          className="w-full h-auto"
          loading="lazy"
        />

        {/* Bottom overlay with buttons */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          {/* Left side - Copy and Download */}
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side - Like button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleLike}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''
                }`}
            />
            {likeCount > 0 && (
              <span className="ml-1 text-xs">{likeCount}</span>
            )}
          </Button>
        </div>
      </div>

      <MemeDialog
        meme={meme}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}