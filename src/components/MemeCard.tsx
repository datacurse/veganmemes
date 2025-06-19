// File: app/components/MemeCard.tsx
"use client";

import { ClientMeme } from "@/lib/queries";
import { useState } from "react";


interface MemeCardProps {
  meme: ClientMeme;
}

export function MemeCard({ meme }: MemeCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-muted transition-all duration-300 hover:shadow-lg hover:shadow-black/10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={`data:${meme.image_type};base64,${meme.image_data}`}
        alt={meme.ocr_text.slice(0, 100)}
        className={`w-full h-auto transition-all duration-500 ${loaded ? "opacity-100" : "opacity-0"
          } ${hovered ? "scale-105" : "scale-100"}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />

      {/* hover overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium line-clamp-3">{meme.ocr_text}</p>
          <p className="text-white/70 text-xs mt-1">
            {new Date(meme.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* skeleton while loading */}
      {!loaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
    </div>
  );
}
