"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false)

  const handleLogout = async () => {
    setIsPending(true)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <Button
      type="button"
      id="unassign-logout-btn"
      variant="outline"
      className="w-full border-border hover:bg-muted/60 text-foreground"
      disabled={isPending}
      onClick={handleLogout}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          Keluar...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Keluar dari Akun
        </span>
      )}
    </Button>
  )
}
