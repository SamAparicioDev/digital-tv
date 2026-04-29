"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FadeIn } from "@/components/animations/motion"
import { ChevronLeft, ChevronRight, Percent, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const promotions = [
  {
    id: 1,
    title: "Netflix Premium",
    description: "Acceso completo a todo el catálogo en 4K Ultra HD",
    discount: "30%",
    originalPrice: 15.99,
    price: 11.19,
    badge: "Más vendido",
    color: "from-red-600 to-red-800",
  },
  {
    id: 2,
    title: "Disney+ Bundle",
    description: "Disney+, Hulu y ESPN+ en un solo paquete",
    discount: "25%",
    originalPrice: 19.99,
    price: 14.99,
    badge: "Popular",
    color: "from-blue-600 to-indigo-800",
  },
  {
    id: 3,
    title: "HBO Max",
    description: "Series exclusivas y estrenos de Warner Bros",
    discount: "40%",
    originalPrice: 14.99,
    price: 8.99,
    badge: "Oferta flash",
    color: "from-purple-600 to-purple-900",
  },
  {
    id: 4,
    title: "Amazon Prime",
    description: "Streaming, envíos gratis y Prime Gaming",
    discount: "20%",
    originalPrice: 12.99,
    price: 10.39,
    badge: "Nuevo",
    color: "from-cyan-500 to-blue-700",
  },
  {
    id: 5,
    title: "Spotify Premium",
    description: "Música sin límites y sin anuncios",
    discount: "35%",
    originalPrice: 9.99,
    price: 6.49,
    badge: "Musical",
    color: "from-green-500 to-green-700",
  },
]

interface PromotionsProps {
  onBuyClick: () => void
}

export function Promotions({ onBuyClick }: PromotionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleBuy = async (id: number) => {
    setLoadingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoadingId(null)
    onBuyClick()
  }

  return (
    <section id="promociones" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  Ofertas especiales
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Promociones del mes
              </h2>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </FadeIn>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promotions.map((promo, index) => (
            <FadeIn
              key={promo.id}
              delay={index * 0.1}
              direction="up"
              className="snap-start"
            >
              <Card
                className={cn(
                  "relative flex-shrink-0 w-[280px] md:w-[300px] overflow-hidden",
                  "bg-card border-border",
                  "transition-all duration-300 ease-out",
                  "hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
                  "hover:border-primary/50 group"
                )}
              >
                {/* Gradient Header */}
                <div className={cn("h-32 bg-gradient-to-br relative", promo.color)}>
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {promo.badge === "Oferta flash" && <Zap className="w-3 h-3" />}
                      {promo.badge === "Nuevo" && <Clock className="w-3 h-3" />}
                      {promo.badge}
                    </span>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-background/90 text-primary text-sm font-bold">
                      -{promo.discount}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {promo.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary">
                      ${promo.price}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${promo.originalPrice}
                    </span>
                    <span className="text-xs text-muted-foreground">/mes</span>
                  </div>

                  {/* Buy Button */}
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    onClick={() => handleBuy(promo.id)}
                    disabled={loadingId === promo.id}
                  >
                    {loadingId === promo.id ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      "Comprar ahora"
                    )}
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
