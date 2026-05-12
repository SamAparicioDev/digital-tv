"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import { ChevronLeft, ChevronRight, Percent, Calendar, Loader2, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Descuento } from "@/lib/api"

interface PromotionsProps {
  onBuyClick: () => void
}

function isVigente(d: Descuento): boolean {
  const now = new Date()
  const inicio = new Date(d.fecha_inicio)
  const fin = d.fecha_fin ? new Date(d.fecha_fin) : null
  return inicio <= now && (!fin || fin >= now)
}

// Paleta de colores de fondo para las tarjetas
const CARD_COLORS = [
  'from-yellow-600 to-yellow-800',
  'from-blue-600 to-indigo-800',
  'from-purple-600 to-purple-900',
  'from-green-600 to-green-800',
  'from-red-600 to-red-800',
]

export function Promotions({ onBuyClick }: PromotionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getDescuentos()
      .then(data => setDescuentos(data.filter(d => d.is_active && isVigente(d))))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" })
    }
  }

  return (
    <section id="promociones" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Ofertas especiales</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Promociones activas</h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => scroll("left")} className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll("right")} className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : descuentos.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <Percent className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No hay promociones activas en este momento.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {descuentos.map((promo, index) => {
              const color = CARD_COLORS[index % CARD_COLORS.length]
              const services = promo.streaming_services ?? []
              const primaryRole = promo.roles?.[0]
              const discountText = promo.valor_global != null && !primaryRole
                ? `${promo.valor_global}${promo.tipo_global === 'porcentaje' ? '%' : ' COP'} OFF`
                : primaryRole
                ? `${primaryRole.pivot.valor_descuento}${primaryRole.pivot.tipo_descuento === 'porcentaje' ? '%' : ' COP'} OFF`
                : null

              return (
                <FadeIn key={promo.id} delay={index * 0.1} direction="up" className="snap-start flex">
                  <Card className={cn(
                    "relative flex-shrink-0 w-[280px] md:w-[300px] min-h-[500px] flex flex-col overflow-hidden bg-card border-border",
                    "transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:border-primary/50 group"
                  )}>
                    {/* Header — altura fija */}
                    <div className={cn("h-28 flex-shrink-0 bg-gradient-to-br relative", color)}>
                      <div className="absolute inset-0 bg-black/20" />
                      {promo.fecha_fin && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-foreground text-xs font-medium">
                            <Calendar className="w-3 h-3" />
                            Hasta {new Date(promo.fecha_fin).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                      )}
                      {discountText && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {discountText}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content — flex column, button siempre al fondo */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Título — altura fija para 2 líneas */}
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                        {promo.nombre}
                      </h3>

                      {/* Código — altura fija */}
                      <div className="h-6 flex items-center mb-2">
                        {promo.codigo ? (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline" className="font-mono text-xs">{promo.codigo}</Badge>
                          </div>
                        ) : <span className="text-xs text-muted-foreground/40">Sin código</span>}
                      </div>

                      {/* Descripción — altura fija para 2 líneas */}
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                        {promo.descripcion || 'Aprovecha esta promoción exclusiva.'}
                      </p>

                      {/* Aplica a — sin overflow para que se vean los badges */}
                      <div className="space-y-1.5 mb-4 flex-1">
                        {promo.roles && promo.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {promo.roles.slice(0, 2).map(r => (
                              <Badge key={r.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {r.nombre}: {r.pivot.valor_descuento}{r.pivot.tipo_descuento === 'porcentaje' ? '%' : ''}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {services.slice(0, 3).map(s => (
                              <Badge key={s.id} variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: s.primary_color ?? undefined }}>
                                {s.name}
                              </Badge>
                            ))}
                            {services.length > 3 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{services.length - 3}</Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Todos los servicios</p>
                        )}
                      </div>

                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] mt-auto flex-shrink-0"
                        onClick={onBuyClick}
                      >
                        Aprovechar oferta
                      </Button>
                    </div>
                  </Card>
                </FadeIn>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
