"use client";

import { Toaster } from "@/components/ui/sonner";
import { SearchBar } from "@/components/SearchBar";
import { UploadDialog } from "@/components/UploadDialog";
import { NavBar } from "@/components/NavBar";
import { QueryClientProvider } from '@tanstack/react-query'
import { Masonic } from "@/components/Masonic";
import { useSnapshot } from "valtio";
import { store } from "@/store";
import { MemeDialog } from "@/components/MemeDialog";
import { queryClient } from "@/lib/query-client";

export default function HomePage() {
  const snap = useSnapshot(store);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="flex items-center gap-3 flex-grow">
              <SearchBar />
              <UploadDialog />
            </div>
            <NavBar />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Masonic />
        </div>
        <Toaster />
        {snap.activeMeme && <MemeDialog />}
      </div>
    </QueryClientProvider>
  );
}