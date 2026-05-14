"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MessageCircle } from "lucide-react"
import { api } from "@/lib/api"

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isPulsing, setIsPulsing] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState<string>("")

  useEffect(() => {
    // Cargar número desde settings, fallback al número fijo
    api.getSettings()
      .then(s => {
        const num = (s.whatsapp_number ?? "").replace(/[^\d]/g, "")
        setWhatsappNumber(num || "3223570025")
      })
      .catch(() => setWhatsappNumber("3223570025"))

    const showTimer = setTimeout(() => setIsVisible(true), 1500)
    const pulseInterval = setInterval(() => {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 2000)
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(pulseInterval)
    }
  }, [])

  const message = encodeURIComponent("Hola, estoy interesado en obtener más información sobre los servicios de Digital TV.")
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${message}`
    : "#"

  // Si no hay número configurado todavía, no renderizar el botón
  // Nunca null - siempre hay número (fallback hardcodeado)
  if (!isVisible) return null

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-[#25D366] hover:bg-[#20BD5A]",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:scale-110",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
        isPulsing && "animate-bounce"
      )}
      aria-label="Contactar por WhatsApp"
    >
      {/* Pulse Ring */}
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75",
          !isPulsing && "hidden"
        )}
      />
      
      {/* Icon */}
      <MessageCircle className="w-7 h-7 text-white fill-white relative z-10" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
        ¡Chatea con nosotros!
      </span>
    </a>
  )
}
