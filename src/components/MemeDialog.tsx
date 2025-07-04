"use client";

import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { store } from "@/store";

// This custom component no longer needs props.
// It gets the active meme directly from the global store.
export function MemeDialog() {
  const snap = useSnapshot(store);
  const activeMeme = snap.activeMeme;

  const handleClose = () => {
    store.activeMeme = null;
  };

  // Add keyboard support for closing the dialog with the 'Escape' key.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (activeMeme) {
      document.addEventListener("keydown", handleKeyDown);
    }

    // Clean up the event listener when the component unmounts or the dialog closes.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMeme]);

  // If no meme is active, render nothing.
  if (!activeMeme) {
    return null;
  }

  return (
    // The full-screen overlay. Clicking it will close the lightbox.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-32 animate-in fade-in-0"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Meme Lightbox"
    >
      {/* The image itself. We let the click event bubble up to the overlay to close it. */}
      <img
        src={`data:image/png;base64,${activeMeme.image_data}`}
        alt={activeMeme.ocr_text.slice(0, 100)}
        className="block max-w-full max-h-full object-contain rounded-lg"
      />
    </div>
  );
}