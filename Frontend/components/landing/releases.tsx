"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/motion"
import { Film, Tv2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Estreno } from "@/lib/api"

export function Releases() {
  const [estrenos, setEstrenos] = useState<Estreno[]>([])
  const [filter, setFilter] = useState<"all" | "pelicula" | "serie">("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getEstrenos()
      .then(data => setEstrenos(data.filter(e => e.is_active)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = estrenos.filter(e => filter === "all" || e.formato === filter)

  return (
    <section id="estrenos" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Novedades</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Últimos estrenos</h2>
            </div>

            <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg">
              {[
                { key: "all", label: "Todos", icon: null },
                { key: "pelicula", label: "Películas", icon: Film },
                { key: "serie", label: "Series", icon: Tv2 },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(item.key as typeof filter)}
                  className={cn(
                    "transition-all duration-300",
                    filter === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aún no hay estrenos publicados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((release, index) => (
              <FadeIn key={release.id} delay={index * 0.05} direction="up">
                <Card className={cn(
                  "relative overflow-hidden bg-card border-border aspect-[2/3]",
                  "transition-all duration-500 ease-out cursor-pointer",
                  "hover:scale-105 hover:z-10 hover:shadow-[0_0_40px_rgba(234,179,8,0.2)] group"
                )}>
                  {/* Imagen */}
                  {release.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={release.imagen_url}
                      alt={release.titulo}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-50"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground/40">
                      {release.formato === 'serie' ? <Tv2 className="w-16 h-16" /> : <Film className="w-16 h-16" />}
                    </div>
                  )}

                  {/* Format badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className={cn("border-none text-white", release.formato === 'serie' ? 'bg-blue-500' : 'bg-purple-500')}>
                      {release.formato === 'serie' ? 'Serie' : 'Película'}
                    </Badge>
                  </div>

                  {/* Gradient + content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(release.streaming_services ?? []).slice(0, 2).map(s => (
                        <Badge key={s.id} variant="outline" className="text-xs border-primary/50 text-primary">{s.name}</Badge>
                      ))}
                    </div>
                    <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {release.titulo}
                    </h3>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
