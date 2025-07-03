import { useCallback } from "react";
import { toast } from "sonner";
import { ClientMeme } from "../lib/types";

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