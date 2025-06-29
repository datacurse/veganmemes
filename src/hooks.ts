import { useCallback } from "react";
import { toast } from "sonner";
import { useSnapshot } from "valtio/react";
import { authClient } from "@/lib/auth-client";
import { likeMeme, unlikeMeme } from "@/lib/queries";
import { store } from "@/store";
import { ClientMeme } from "./lib/types";

export function useCopyImage(meme: ClientMeme) {
  const dataUri = `data:image/png;base64,${meme.image_data}`;

  return useCallback(async () => {
    try {
      const blob = await fetch(dataUri).then((r) => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Image copied to clipboard");
    } catch {
      toast.error("Failed to copy image");
    }
  }, [dataUri]);
}

export function useDownloadImage(meme: ClientMeme) {
  const dataUri = `data:image/png;base64,${meme.image_data}`;

  return useCallback(() => {
    try {
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = `veganmemes-${meme.id ?? Date.now()}.png`;
      link.click();
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to download image");
    }
  }, [dataUri, meme.id]);
}

export function useLikeMeme(memeId: number) {
  // Subscribe to the store so the component re‑renders when the meme changes.
  const snap = useSnapshot(store);

  // Helper to find the meme in the paginated list.
  const meme = snap.pages
    .flatMap((p) => p.items)
    .find((item) => item.id === memeId);

  const isLiked = meme?.is_liked ?? false;
  const likeCount = meme?.like_count ?? 0;

  const toggleLike = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      const { data: session } = await authClient.getSession();
      // Trigger GitHub login if the user isn't authenticated.
      if (!session?.user) {
        await authClient.signIn.social({ provider: "github" });
        return;
      }

      const userId = session.user.id;

      try {
        if (isLiked) {
          await unlikeMeme(memeId, userId);
          updateStore(false);
        } else {
          await likeMeme(memeId, userId);
          updateStore(true);
        }
      } catch (err: any) {
        if (
          !err.message?.includes("Already liked this meme") &&
          !err.message?.includes("Haven't liked")
        ) {
          toast.error("Failed to update like");
        }
      }
    },
    [isLiked, memeId]
  );

  /**
   * Mutates the Valtio store in‑place so all subscribed components update.
   */
  const updateStore = (liked: boolean) => {
    for (const page of store.pages) {
      const item = page.items.find((i) => i.id === memeId);
      if (item) {
        item.is_liked = liked;
        item.like_count = liked
          ? item.like_count + 1
          : Math.max(0, item.like_count - 1);
      }
    }
  };

  return { isLiked, likeCount, toggleLike };
}
