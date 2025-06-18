"use client"

import { useSnapshot } from "valtio"
import { store, selectAllMemes, search, loadMore, upload } from "@/store"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function HomePage() {
  const snap = useSnapshot(store)
  const memes = selectAllMemes()
  const [open, setOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (store.pages.length === 0) search()
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !snap.loading && !snap.uploading) {
        loadMore()
      }
    })

    io.observe(el)
    return () => io.disconnect()
  }, [snap.loading, snap.uploading])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search memes..."
              value={snap.query}
              onChange={(e) => (store.query = e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="flex-1 max-w-md"
            />
            <Button onClick={search} disabled={snap.loading}>
              Search
            </Button>

            <Dialog open={open} onOpenChange={(v) => !snap.uploading && setOpen(v)}>
              <DialogTrigger asChild>
                <Button variant="secondary">Upload</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Meme</DialogTitle>
                  <DialogDescription>Upload a new meme with its text content.</DialogDescription>
                </DialogHeader>
                <UploadForm onClose={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MasonryGrid memes={memes} />
      </div>

      {snap.loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading more memes...
          </div>
        </div>
      )}

      {snap.pages.at(-1)?.nextCursor && !snap.uploading && <div ref={sentinelRef} className="h-10" />}
    </div>
  )
}

function MasonryGrid({ memes }: { memes: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState<any[][]>([])
  const [columnCount, setColumnCount] = useState(4)

  // Responsive column count
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth
      if (width < 640)
        setColumnCount(2) // mobile
      else if (width < 768)
        setColumnCount(3) // tablet
      else if (width < 1024)
        setColumnCount(4) // small desktop
      else if (width < 1280)
        setColumnCount(5) // medium desktop
      else if (width < 1536)
        setColumnCount(6) // large desktop
      else setColumnCount(7) // xl desktop
    }

    updateColumnCount()
    window.addEventListener("resize", updateColumnCount)
    return () => window.removeEventListener("resize", updateColumnCount)
  }, [])

  // Distribute memes across columns
  useEffect(() => {
    if (memes.length === 0) {
      setColumns([])
      return
    }

    // Initialize columns
    const newColumns: any[][] = Array.from({ length: columnCount }, () => [])
    const columnHeights = new Array(columnCount).fill(0)

    // Distribute memes to the shortest column
    memes.forEach((meme) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      newColumns[shortestColumnIndex].push(meme)
      // Estimate height based on aspect ratio (we'll use a base height + some variation)
      columnHeights[shortestColumnIndex] += 250 + Math.random() * 200
    })

    setColumns(newColumns)
  }, [memes, columnCount])

  return (
    <div ref={containerRef} className="flex gap-4" style={{ minHeight: "200px" }}>
      {columns.map((columnMemes, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-4">
          {columnMemes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>
      ))}
    </div>
  )
}

function MemeCard({ meme }: { meme: any }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-muted transition-all duration-300 hover:shadow-lg hover:shadow-black/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={`data:${meme.image_type};base64,${meme.image_data}`}
        alt={meme.ocr_text.slice(0, 100)}
        className={`w-full h-auto transition-all duration-500 ${isLoaded ? "opacity-100" : "opacity-0"
          } ${isHovered ? "scale-105" : "scale-100"}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium line-clamp-3">{meme.ocr_text}</p>
          <p className="text-white/70 text-xs mt-1">{new Date(meme.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Loading skeleton */}
      {!isLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
    </div>
  )
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const snap = useSnapshot(store)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(async () => {
    const file = fileRef.current?.files?.[0]
    const text = textRef.current?.value.trim() || ""
    if (!file || !text) return

    try {
      await upload(file, text)
      onClose()
      if (fileRef.current) fileRef.current.value = ""
      if (textRef.current) textRef.current.value = ""
    } catch (err) {
      console.error("Upload failed:", err)
    }
  }, [onClose])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Choose Image</label>
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          disabled={snap.uploading}
          className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Content</label>
        <textarea
          ref={textRef}
          rows={4}
          placeholder="Describe the text content of this meme..."
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          disabled={snap.uploading}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={snap.uploading} className="flex-1">
          {snap.uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Upload Meme"
          )}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={snap.uploading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
