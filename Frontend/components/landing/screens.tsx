"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn, StaggerContainer } from "@/components/animations/motion"
import { Monitor, Users, Check, Wifi, Shield, Tv } from "lucide-react"
import { cn } from "@/lib/utils"

const screens = [
  {
    id: 1,
    platform: "Netflix",
    type: "Pantalla Individual",
    price: 4.99,
    features: ["1 Perfil", "HD 1080p", "1 Dispositivo", "30 días"],
    available: 12,
    icon: Tv,
    color: "bg-red-500",
  },
  {
    id: 2,
    platform: "Netflix",
    type: "Cuenta Completa",
    price: 11.99,
    features: ["4 Perfiles", "4K Ultra HD", "4 Dispositivos", "30 días"],
    available: 5,
    popular: true,
    icon: Monitor,
    color: "bg-red-500",
  },
  {
    id: 3,
    platform: "Disney+",
    type: "Pantalla Individual",
    price: 3.99,
    features: ["1 Perfil", "HD 1080p", "1 Dispositivo", "30 días"],
    available: 8,
    icon: Tv,
    color: "bg-blue-600",
  },
  {
    id: 4,
    platform: "Disney+",
    type: "Cuenta Completa",
    price: 9.99,
    features: ["4 Perfiles", "4K Ultra HD", "4 Dispositivos", "30 días"],
    available: 3,
    icon: Monitor,
    color: "bg-blue-600",
  },
  {
    id: 5,
    platform: "HBO Max",
    type: "Pantalla Individual",
    price: 4.49,
    features: ["1 Perfil", "HD 1080p", "1 Dispositivo", "30 días"],
    available: 15,
    icon: Tv,
    color: "bg-purple-600",
  },
  {
    id: 6,
    platform: "HBO Max",
    type: "Cuenta Completa",
    price: 10.99,
    features: ["5 Perfiles", "4K Ultra HD", "3 Dispositivos", "30 días"],
    available: 0,
    icon: Monitor,
    color: "bg-purple-600",
  },
]

interface ScreensProps {
  onBuyClick: () => void
}

export function Screens({ onBuyClick }: ScreensProps) {
  const [filter, setFilter] = useState<string>("all")

  // Las pantallas de la landing son datos ilustrativos.
  // El catálogo real de ofertas está en /tienda.
  const filteredScreens = filter === "all" ? screens : screens.filter((s) => s.platform.toLowerCase() === filter)

  return (
    <section id="pantallas" className="py-20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Catálogo de pantallas
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Venta de pantallas de streaming
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Elige entre pantallas individuales o cuentas completas según tus necesidades
            </p>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {["all", "netflix", "disney+", "hbo max"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  "transition-all duration-300",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "hover:border-primary hover:text-primary"
                )}
              >
                {f === "all" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </FadeIn>

        {/* Grid */}
        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {filteredScreens.map((screen) => (
            <Card
              key={screen.id}
              className={cn(
                "relative overflow-hidden bg-card border-border p-6",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
                "hover:border-primary/50 group",
                screen.available === 0 && "opacity-60"
              )}
            >
              {/* Popular Badge */}
              {screen.popular && (
                <div className="absolute -top-1 -right-12 rotate-45">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-10">
                    Popular
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", screen.color)}>
                    <screen.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{screen.platform}</h3>
                    <p className="text-sm text-muted-foreground">{screen.type}</p>
                  </div>
                </div>
                
                {/* Availability */}
                <Badge
                  variant={screen.available > 0 ? "default" : "secondary"}
                  className={cn(
                    "transition-all duration-300",
                    screen.available > 0
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30",
                    screen.available > 0 && screen.available <= 5 && "animate-pulse"
                  )}
                >
                  {screen.available > 0 ? (
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      {screen.available} disponibles
                    </span>
                  ) : (
                    "Agotado"
                  )}
                </Badge>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {screen.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-2xl font-bold text-foreground">${screen.price}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
                <Button
                  onClick={onBuyClick}
                  disabled={screen.available === 0}
                  className={cn(
                    "transition-all duration-300",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]",
                    "disabled:bg-muted disabled:text-muted-foreground"
                  )}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Comprar
                </Button>
              </div>
            </Card>
          ))}
        </StaggerContainer>      
      </div>
    </section>
  )
}
