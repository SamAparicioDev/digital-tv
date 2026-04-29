"use client"

import Link from "next/link"
import { FadeIn } from "@/components/animations/motion"
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react"

const footerLinks = {
  productos: [
    { label: "Netflix", href: "#" },
    { label: "Disney+", href: "#" },
    { label: "HBO Max", href: "#" },
    { label: "Amazon Prime", href: "#" },
    { label: "Spotify", href: "#" },
  ],
  soporte: [
    { label: "Centro de ayuda", href: "#" },
    { label: "Tutoriales", href: "#tutoriales" },
    { label: "Contacto", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  empresa: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Términos de uso", href: "#" },
    { label: "Privacidad", href: "#" },
    { label: "Reembolsos", href: "#" },
  ],
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="relative">
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-m2jddRXSFYlrahyQfPp0OEWhxRTKDl.png" 
                    alt="DigitalTv Logo" 
                    className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Digital<span className="text-primary">Tv</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Tu plataforma de confianza para acceder a los mejores servicios de streaming a precios increíbles.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                  <span>soporte@digitaltv.com</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <Phone className="w-4 h-4" />
                  <span>+1 234 567 890</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <MapPin className="w-4 h-4" />
                  <span>Miami, FL, USA</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Productos</h4>
              <ul className="space-y-2">
                {footerLinks.productos.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <ul className="space-y-2">
                {footerLinks.soporte.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2">
                {footerLinks.empresa.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Bottom Section */}
        <FadeIn delay={0.2}>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DigitalTv. Todos los derechos reservados.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}
