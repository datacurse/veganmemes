"use client";
import { Download, Copy } from "lucide-react";
import { useSnapshot } from "valtio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { store } from "@/store";
import { ClientMeme } from "@/lib/types";
import { useCopyImage } from "@/hooks/useCopyImage";
import { useDownloadImage } from "@/hooks/useDownloadImage";

export function MemeDialog({ meme }: { meme: ClientMeme }) {
  const snap = useSnapshot(store);
  const copy = useCopyImage(meme);
  const download = useDownloadImage(meme);

  const handleOpenChange = (isOpen: boolean) => {
    store.memeDialog = isOpen;
    if (!isOpen) {
      store.activeMeme = null;
    }
  };

  return (
    <Dialog open={snap.memeDialog} onOpenChange={handleOpenChange}>
      {/* The onInteractOutside prop has been removed from DialogContent */}
      <DialogContent className="max-w-4xl p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="md:w-1/2 bg-muted p-4 flex items-center justify-center">
            <img
              src={`data:image/png;base64,${meme.image_data}`}
              alt={meme.ocr_text.slice(0, 100)}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>

          {/* Details section */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle>Meme Details</DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-4 flex-1">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  OCR Text
                </h3>
                <p className="text-sm">{meme.ocr_text || "No text detected"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Created
                </h3>
                <p className="text-sm">
                  {new Date(meme.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex-1" />

              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={copy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={download}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}