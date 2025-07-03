import { useCallback } from "react";
import { toast } from "sonner";
import { ClientMeme } from "../lib/types";

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