'use client';

import { useSnapshot } from 'valtio';
import { store, selectAllMemes } from '@/store';
import {
  Input
} from '@/components/ui/input';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function HomePage() {
  const snap = useSnapshot(store);
  const memes = selectAllMemes();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (store.pages.length === 0) store.search();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) store.loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [snap.pages]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Input
          placeholder="Search text on the meme…"
          value={snap.query}
          onChange={(e) => (store.query = e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && store.search()}
          className="flex-1"
        />
        <Button onClick={store.search}>Search</Button>

        <Dialog
          open={snap.showUploader}
          onOpenChange={(v) => (store.showUploader = v)}
        >
          <DialogTrigger asChild>
            <Button variant="secondary">Upload</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <UploadForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {memes.map((m) => (
          <img
            key={m.id}
            src={m.image_url}
            alt={m.ocr_text.slice(0, 100)}
            className="w-full rounded-lg shadow-sm break-inside-avoid"
          />
        ))}
      </div>

      {snap.loading && (
        <div className="text-center py-4 font-medium">Loading…</div>
      )}

      {snap.pages.at(-1)?.nextCursor && (
        <div ref={sentinelRef} className="h-10" />
      )}
    </div>
  );
}

function UploadForm() {
  const snap = useSnapshot(store);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const file = fileRef.current?.files?.[0];
    const text = textRef.current?.value.trim() || '';
    if (!file || !text) return;

    const url = await uploadFileMock(file);

    await store.upload(url, text);
    store.showUploader = false;
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" ref={fileRef} />
      <textarea
        ref={textRef}
        rows={4}
        placeholder="Text on the meme…"
        className="w-full border rounded p-2"
      />
      <Button onClick={handleSubmit} disabled={snap.uploading}>
        {snap.uploading ? 'Uploading…' : 'Upload'}
      </Button>
    </div>
  );
}

async function uploadFileMock(file: File): Promise<string> {
  return URL.createObjectURL(file);
}