"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

export interface AppNotification {
  id: string
  title: string
  message: string
  href: string
  type: "success" | "warning" | "error" | "info"
  createdAt: string
}

const SEEN_KEY = "dtv_seen_notifs"
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")) } catch { return new Set() }
}

function persistSeen(seen: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
}

function isRecent(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < SEVEN_DAYS
}

export function useNotifications() {
  const { user, isAdmin, isRoleResolved } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const initialized = useRef(false)

  // Load seenIds from localStorage once on client
  useEffect(() => {
    if (!initialized.current) { setSeenIds(loadSeen()); initialized.current = true }
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (!user || !isRoleResolved) return

    const notifs: AppNotification[] = []

    try {
      if (isAdmin) {
        // Admin: solicitudes pendientes
        const txs = await api.getAdminTransacciones("PENDIENTE")
        txs.slice(0, 20).forEach((tx) => {
          const isRecarga = tx.tipo === "deposit"
          notifs.push({
            id: `admin-pend-${tx.id}`,
            title: isRecarga ? "Solicitud de recarga pendiente" : "Solicitud de compra pendiente",
            message: `${tx.wallet?.user?.name ?? "Usuario"} — $${Number(tx.monto).toLocaleString("es-CO")}`,
            href: "/admin/saldo",
            type: "warning",
            createdAt: tx.created_at,
          })
        })
      } else {
        // Usuario: recargas aprobadas/rechazadas (últimos 7 días)
        const recargasData = await api.getRecargas().catch(() => null)
        recargasData?.transacciones
          .filter((t) => t.tipo === "deposit" && t.estado !== "PENDIENTE" && isRecent(t.created_at))
          .forEach((tx) => {
            const aprobada = tx.estado === "APROBADO"
            notifs.push({
              id: `rec-${tx.estado.toLowerCase()}-${tx.id}`,
              title: aprobada ? "¡Recarga aprobada!" : "Recarga rechazada",
              message: aprobada
                ? `+$${Number(tx.monto).toLocaleString("es-CO")} añadidos a tu saldo`
                : `Tu solicitud de $${Number(tx.monto).toLocaleString("es-CO")} fue rechazada`,
              href: "/dashboard/saldo",
              type: aprobada ? "success" : "error",
              createdAt: tx.created_at,
            })
          })

        // Compras aprobadas/rechazadas (últimos 7 días)
        const compras = await api.getCompras().catch(() => [])
        compras
          .filter((c) => c.estado !== "pendiente" && isRecent(c.created_at))
          .forEach((c) => {
            const aprobada = c.estado === "aprobada"
            notifs.push({
              id: `compra-${c.estado}-${c.id}`,
              title: aprobada ? "¡Compra aprobada!" : "Compra rechazada",
              message: aprobada
                ? "Tu servicio ya está disponible en Mis Cuentas"
                : "Tu compra fue rechazada y el saldo devuelto",
              href: aprobada ? "/dashboard/mis-cuentas" : "/dashboard/saldo",
              type: aprobada ? "success" : "error",
              createdAt: c.created_at,
            })
          })
      }
    } catch { /* silencioso */ }

    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setNotifications(notifs)
  }, [user, isAdmin, isRoleResolved])

  // Poll each 30 segundos
  useEffect(() => {
    if (!user || !isRoleResolved) return
    fetchNotifications()
    const id = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(id)
  }, [user, isRoleResolved, fetchNotifications])

  const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const opening = !prev
      if (opening) {
        // Marcar todas como vistas cuando se abre el panel
        const next = new Set(seenIds)
        notifications.forEach((n) => next.add(n.id))
        setSeenIds(next)
        persistSeen(next)
      }
      return opening
    })
  }

  const dismiss = (id: string) => {
    const next = new Set(seenIds)
    next.add(id)
    setSeenIds(next)
    persistSeen(next)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return { notifications, unreadCount, isOpen, toggleOpen, dismiss }
}
