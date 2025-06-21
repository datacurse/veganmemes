"use client";
import { Download, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientMeme } from "@/lib/types";
import { toast } from "sonner";

interface MemeDialogProps {
  meme: ClientMeme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemeDialog({ meme, open, onOpenChange }: MemeDialogProps) {
  const handleDownload = () => {
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

  const handleCopy = async () => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-2">OCR Text</h3>
                <p className="text-sm">{meme.ocr_text || "No text detected"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                <p className="text-sm">
                  {new Date(meme.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Space for future metadata */}
              <div className="flex-1" />

              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
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