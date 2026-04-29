"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/motion"
import { Film, Tv2, Star, Play, Calendar, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const releases = [
  {
    id: 1,
    title: "El Problema de los 3 Cuerpos",
    type: "Serie",
    platform: "Netflix",
    rating: 8.7,
    year: 2024,
    genre: "Ciencia Ficción",
    isNew: true,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
  },
  {
    id: 2,
    title: "Dune: Parte Dos",
    type: "Película",
    platform: "HBO Max",
    rating: 9.1,
    year: 2024,
    genre: "Ciencia Ficción",
    isNew: true,
    image: "https://images.unsplash.com/photo-1608346128025-1896b97a6fa7?w=400&h=600&fit=crop",
  },
  {
    id: 3,
    title: "Shogun",
    type: "Serie",
    platform: "Disney+",
    rating: 9.0,
    year: 2024,
    genre: "Drama Histórico",
    isNew: true,
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=600&fit=crop",
  },
  {
    id: 4,
    title: "The Bear",
    type: "Serie",
    platform: "Disney+",
    rating: 8.9,
    year: 2024,
    genre: "Drama",
    isNew: false,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop",
  },
  {
    id: 5,
    title: "Oppenheimer",
    type: "Película",
    platform: "Amazon Prime",
    rating: 8.8,
    year: 2023,
    genre: "Biografía",
    isNew: false,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
  },
  {
    id: 6,
    title: "House of the Dragon",
    type: "Serie",
    platform: "HBO Max",
    rating: 8.5,
    year: 2024,
    genre: "Fantasía",
    isNew: true,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
  },
  {
    id: 7,
    title: "Fallout",
    type: "Serie",
    platform: "Amazon Prime",
    rating: 8.6,
    year: 2024,
    genre: "Post-apocalíptico",
    isNew: true,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
  },
  {
    id: 8,
    title: "Poor Things",
    type: "Película",
    platform: "Disney+",
    rating: 8.4,
    year: 2024,
    genre: "Comedia",
    isNew: false,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
  },
]

export function Releases() {
  const [filter, setFilter] = useState<"all" | "movie" | "series">("all")
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const filteredReleases = releases.filter((r) => {
    if (filter === "all") return true
    if (filter === "movie") return r.type === "Película"
    return r.type === "Serie"
  })

  return (
    <section id="estrenos" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  Novedades
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Últimos estrenos
              </h2>
            </div>

            <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg">
              {[
                { key: "all", label: "Todos", icon: null },
                { key: "movie", label: "Películas", icon: Film },
                { key: "series", label: "Series", icon: Tv2 },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(item.key as typeof filter)}
                  className={cn(
                    "transition-all duration-300",
                    filter === item.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredReleases.map((release, index) => (
            <FadeIn key={release.id} delay={index * 0.05} direction="up">
              <Card
                className={cn(
                  "relative overflow-hidden bg-card border-border aspect-[2/3]",
                  "transition-all duration-500 ease-out cursor-pointer",
                  "hover:scale-105 hover:z-10 hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]",
                  "group"
                )}
                onMouseEnter={() => setHoveredId(release.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image */}
                <img
                  src={release.image || "/placeholder.svg"}
                  alt={release.title}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-50"
                  loading="lazy"
                />

                {/* New Badge */}
                {release.isNew && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-primary text-primary-foreground animate-pulse">
                      Nuevo
                    </Badge>
                  </div>
                )}

                {/* Rating */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {release.rating}
                    </span>
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                      {release.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {release.year}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {release.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {release.type} • {release.genre}
                  </p>
                </div>

                {/* Hover Actions */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300",
                    hoveredId === release.id ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-110"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-10 h-10 rounded-full border-foreground/50 text-foreground hover:border-primary hover:text-primary transition-all duration-300 bg-transparent"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* View All Button */}
        <FadeIn delay={0.5}>
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent"
            >
              Ver todo el catálogo
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
