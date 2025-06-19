"use client";

import { useState, useCallback, useRef } from "react";
import { useSnapshot } from "valtio";
import { store, upload } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const snap = useSnapshot(store);

  const handleSubmit = useCallback(async () => {
    if (!snap.uploadFile || snap.uploadText.trim() === "") return;

    try {
      await upload(snap.uploadFile, snap.uploadText);
      store.uploadFile = null;
      store.uploadText = "";
      setFileInputKey((k) => k + 1);
      setOpen(false);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }, [snap.uploadFile, snap.uploadText]);

  return (
    <Dialog open={open} onOpenChange={(v) => !snap.uploading && setOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="secondary">Upload</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Meme</DialogTitle>
          <DialogDescription>Upload a new meme with its text content.</DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Choose Image</label>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              disabled={snap.uploading}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              onChange={(e) => (store.uploadFile = e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Text Content</label>
            <textarea
              rows={4}
              placeholder="Describe the text content of this meme..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={snap.uploading}
              value={snap.uploadText}
              onChange={(e) => (store.uploadText = e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={snap.uploading || !snap.uploadFile} className="flex-1">
              {snap.uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload Meme"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                store.uploadFile = null;
                store.uploadText = "";
                setFileInputKey((k) => k + 1);
              }}
              disabled={snap.uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}