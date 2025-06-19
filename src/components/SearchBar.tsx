"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { store, search } from "@/store";
import { useSnapshot } from "valtio";

export function SearchBar() {
  const snap = useSnapshot(store);

  return (
    <>
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
    </>
  );
}