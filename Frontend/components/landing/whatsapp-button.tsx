"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
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
        setWhatsappNumber(num || "573223570025")
      })
      .catch(() => setWhatsappNumber("573223570025"))

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
      
      {/* Icon - WhatsApp SVG oficial */}
      <svg
        className="w-7 h-7 text-white relative z-10"
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.557 4.127 1.533 5.862L.057 23.486a.5.5 0 00.609.61l5.701-1.494A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.724.977.994-3.63-.234-.374A9.818 9.818 0 1112 21.818z"/>
      </svg>
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
        ¡Chatea con nosotros!
      </span>
    </a>
  )
}
