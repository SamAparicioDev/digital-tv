"use client"

import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function LogoutOverlay() {
  const { isLoggingOut } = useAuth()
  if (!isLoggingOut) return null
  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Cerrando sesión...</p>
    </div>
  )
}
