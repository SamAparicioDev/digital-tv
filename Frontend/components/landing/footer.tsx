"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FadeIn } from "@/components/animations/motion"
import { Instagram, MessageCircle, Mail, MapPin, Phone } from "lucide-react"
import { api, type SiteSettings } from "@/lib/api"

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({})

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {})
  }, [])

  const siteName    = settings.site_name        ?? "DigitalTv"
  const siteDesc    = settings.site_description ?? "Tu plataforma de confianza para acceder a los mejores servicios de streaming a precios increíbles."
  const email       = settings.support_email    ?? "soporte@digitaltv.com"
  const phone       = settings.support_phone    ?? "+57 300 123 4567"
  const address     = settings.support_address  ?? "Colombia"
  const whatsappRaw = (settings.whatsapp_number ?? "+57 300 123 4567").replace(/[^\d]/g, "")

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <FadeIn>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-10 h-10">
                <Image src="/logo.png" alt={`${siteName} Logo`} fill
                  className="rounded-full transition-transform duration-300 group-hover:scale-110" priority />
              </div>
              <span className="text-xl font-bold text-foreground">
                {siteName.includes('Tv')
                  ? <>{siteName.replace(/Tv$/i, '')}<span className="text-primary">Tv</span></>
                  : siteName}
              </span>
            </Link>

            <p className="text-sm text-muted-foreground mb-6 max-w-md">{siteDesc}</p>

            {/* Contact info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-6">
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </a>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{address}</span>
              </div>
            </div>

            {/* Social Links — solo Instagram + WhatsApp */}
            <div className="flex items-center gap-3">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </Link>
              {whatsappRaw && (
                <Link href={`https://wa.me/${whatsappRaw}`} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp">
                  <MessageCircle className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Bottom */}
        <FadeIn delay={0.2}>
          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}
