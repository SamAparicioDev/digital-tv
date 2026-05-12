"use client"

import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, X, CheckCheck, AlertTriangle, Info, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNotifications, type AppNotification } from "@/hooks/use-notifications"

const TYPE_STYLES = {
  success: { icon: CheckCheck, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
} as const

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "ahora"
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

function NotificationItem({ notif, onDismiss }: { notif: AppNotification; onDismiss: (id: string) => void }) {
  const router = useRouter()
  const { icon: Icon, color, bg } = TYPE_STYLES[notif.type]

  const handleClick = () => {
    router.push(notif.href)
    onDismiss(notif.id)
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-opacity hover:opacity-80",
        bg
      )}
      onClick={handleClick}
    >
      <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">{notif.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.message}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
      <button
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); onDismiss(notif.id) }}
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function NotificationPanel() {
  const { notifications, unreadCount, isOpen, toggleOpen, dismiss } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        toggleOpen()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen, toggleOpen])

  return (
    <div ref={panelRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={toggleOpen}
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] flex flex-col rounded-xl border border-border bg-popover shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <span className="text-sm font-semibold text-foreground">Notificaciones</span>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">{notifications.length} en total</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notif={n} onDismiss={dismiss} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
