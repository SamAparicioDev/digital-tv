"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import { Monitor, Users, Check, Wifi, Loader2, Tv } from "lucide-react"
import { cn, formatCOP } from "@/lib/utils"
import { api, type Oferta } from "@/lib/api"

interface ScreensProps {
  onBuyClick: () => void
}

export function Screens({ onBuyClick }: ScreensProps) {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    api.getOfertas()
      .then(data => setOfertas(data.filter(o => o.is_active && o.stock > 0)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Servicios únicos para los filtros
  const uniqueServices = Array.from(
    new Map(
      ofertas.flatMap(o => o.servicios).map(s => [s.id, s])
    ).values()
  )

  const filtered = filter === "all"
    ? ofertas
    : ofertas.filter(o => o.servicios.some(s => s.name.toLowerCase() === filter))

  return (
    <section id="pantallas" className="py-20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Catálogo de servicios
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Streaming disponible
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cuentas completas o perfiles individuales para todos los gustos
            </p>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Filters */}
            {uniqueServices.length > 0 && (
              <FadeIn delay={0.1}>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                  <Button
                    variant={filter === "all" ? "default" : "outline"} size="sm"
                    onClick={() => setFilter("all")}
                    className={cn(filter === "all" ? "bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary")}>
                    Todas
                  </Button>
                  {uniqueServices.map(s => (
                    <Button key={s.id} variant={filter === s.name.toLowerCase() ? "default" : "outline"} size="sm"
                      onClick={() => setFilter(s.name.toLowerCase())}
                      className={cn(filter === s.name.toLowerCase() ? "bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary")}>
                      {s.name}
                    </Button>
                  ))}
                </div>
              </FadeIn>
            )}

            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>No hay ofertas disponibles en este momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((oferta, i) => {
                  const servicio = oferta.servicios[0]
                  const color = servicio?.primary_color ?? '#6B7280'
                  const nombre = oferta.servicios.map(s => s.name).join(' + ')
                  const perfiles = oferta.servicios[0]?.pivot?.numero_perfiles ?? 0
                  const dias = oferta.servicios[0]?.pivot?.duracion_dias ?? 30

                  return (
                    <FadeIn key={oferta.id} delay={i * 0.08} direction="up">
                      <Card className="relative overflow-hidden bg-card border-border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:border-primary/50 group">
                        {/* Color bar */}
                        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 mt-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}25` }}>
                              {oferta.cuenta_completa
                                ? <Monitor className="w-5 h-5" style={{ color }} />
                                : <Tv className="w-5 h-5" style={{ color }} />}
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">{nombre}</h3>
                              <p className="text-sm text-muted-foreground">
                                {oferta.cuenta_completa ? 'Cuenta completa' : `${perfiles} perfil${perfiles !== 1 ? 'es' : ''}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            oferta.stock > 5 ? "text-green-500 border-green-500/30" :
                            oferta.stock > 0 ? "text-yellow-500 border-yellow-500/30 animate-pulse" :
                            "text-red-500 border-red-500/30"
                          )}>
                            <Wifi className="w-3 h-3 mr-1" />
                            {oferta.stock > 0 ? `${oferta.stock} disponibles` : 'Agotado'}
                          </Badge>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {[
                            oferta.cuenta_completa ? 'Acceso completo' : `${perfiles} perfil${perfiles !== 1 ? 'es' : ''} asignado${perfiles !== 1 ? 's' : ''}`,
                            `${dias} días de vigencia`,
                            oferta.garantia_dias > 0 ? `${oferta.garantia_dias} días de garantía` : null,
                            oferta.cuenta_completa ? 'Email y contraseña propios' : 'Perfil personalizado',
                          ].filter(Boolean).map((f, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <span className="text-2xl font-bold text-foreground">{formatCOP(oferta.precio)}</span>
                            <span className="text-sm text-muted-foreground">/{dias}d</span>
                          </div>
                          <Button
                            onClick={onBuyClick}
                            disabled={oferta.stock === 0}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:bg-muted disabled:text-muted-foreground transition-all duration-300"
                          >
                            Comprar
                          </Button>
                        </div>
                      </Card>
                    </FadeIn>
                  )
                })}
              </div>
            )}

            {/* Info Banner */}
            <FadeIn delay={0.4}>
              <div className="mt-12 p-6 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                  <Users className="w-10 h-10 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">¿Eres mayorista o revendedor?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contáctanos para obtener precios especiales y acceso a inventario prioritario
                    </p>
                  </div>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent">
                    Contactar
                  </Button>
                </div>
              </div>
<<<<<<< HEAD
            </FadeIn>
          </>
        )}
      </div>
    </section>
  )
}
