"use client";

import { useState } from "react";
import { useRouter } from "waku";
import { User2, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NavBar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleAuth = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!session) {
      e.preventDefault();
      await authClient.signIn.social({ provider: "github" });
    } else {
      e.preventDefault();
      setShowLogoutDialog(true);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setShowLogoutDialog(false);
    router.reload();
  };

  return (
    <>
      <button
        onClick={handleAuth}
        className="group relative inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-gray-200">
          {!session ? (
            <div className="grid h-full w-full place-items-center bg-muted">
              <User2 className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-muted text-sm font-medium uppercase">
              {session.user.name?.[0] ?? "?"}
            </div>
          )}
        </div>

        <span
          className={cn(
            "absolute -bottom-9 left-1/2 -translate-x-1/2",
            "rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
            "shadow-lg ring-1 ring-border"
          )}
        >
          {session ? "Profile" : "Log in"}
        </span>
      </button>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}