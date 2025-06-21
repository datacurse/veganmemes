"use client";

import { Download, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MemeDialog } from "./MemeDialog";
import { toast } from "sonner";
import { ClientMeme } from "@/lib/types";

export function MemeCard({ meme }: { meme: ClientMeme }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${meme.image_data}`;
      link.download = `veganmemes-${meme.id}.png`;
      link.click();
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

        {/* Hover buttons */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
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