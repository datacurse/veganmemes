"use client";

import { Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { store } from "@/store";
import { useSnapshot } from "valtio";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const snap = useSnapshot(store);
  const { data: session } = authClient.useSession();

  const toggleLikedFilter = async () => {
    if (!session) {
      await authClient.signIn.social({ provider: "github" });
      return;
    }

    // Toggle between "all" and "liked"
    store.filter = store.filter === "liked" ? "all" : "liked";
    // search();
  };

  const handleSearch = () => {
    // Reset to "all" filter when doing a new search
    if (store.filter === "liked" && snap.query !== store.query) {
      store.filter = "all";
    }
    // search();
  };

  return (
    <div className="flex items-center gap-2 flex-1 max-w-2xl">
      <div className="relative flex-1">
        <Input
          placeholder="Search memes..."
          value={snap.query}
          onChange={(e) => (store.query = e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pr-10"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleLikedFilter}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7",
            !session && "opacity-50"
          )}
          title={session ? "Filter liked memes" : "Login to filter liked memes"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              snap.filter === "liked" ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )}
          />
        </Button>
      </div>

      <Button onClick={handleSearch} disabled={false}>
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
}