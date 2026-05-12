"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import { Play, Clock, X, BookOpen, Loader2, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Tutorial } from "@/lib/api"

export function Tutorials() {
  const [tutoriales, setTutoriales] = useState<Tutorial[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getTutoriales()
      .then(data => setTutoriales(data.filter(t => t.is_active)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section id="tutoriales" className="py-20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Centro de ayuda
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tutoriales en video
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Aprende a sacar el máximo provecho de tus cuentas de streaming
            </p>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : tutoriales.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Youtube className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aún no hay tutoriales publicados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutoriales.map((tutorial, index) => (
              <FadeIn key={tutorial.id} delay={index * 0.1} direction="up">
                <Card
                  className={cn(
                    "overflow-hidden bg-card border-border cursor-pointer group",
                    "transition-all duration-300 ease-out",
                    "hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
                    "hover:border-primary/50"
                  )}
                  onClick={() => setSelectedVideo(tutorial)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail desde YouTube */}
                    <div className="relative w-full sm:w-48 md:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
                      {tutorial.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tutorial.thumbnail_url}
                          alt={tutorial.titulo}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Youtube className="w-12 h-12 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                        </div>
                      </div>

                      {tutorial.duracion && (
                        <div className="absolute bottom-2 right-2">
                          <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                            <Clock className="w-3 h-3 mr-1" />
                            {tutorial.duracion}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-4 sm:p-5">
                      {tutorial.categoria && (
                        <Badge variant="outline" className="mb-2 text-xs border-primary/50 text-primary">
                          {tutorial.categoria.nombre}
                        </Badge>
                      )}
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {tutorial.titulo}
                      </h3>
                      {tutorial.descripcion && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tutorial.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {/* Video modal con iframe de YouTube */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-card rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="aspect-video bg-black">
              {selectedVideo.embed_url ? (
                <iframe
                  src={`${selectedVideo.embed_url}?autoplay=1`}
                  title={selectedVideo.titulo}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Video no disponible
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{selectedVideo.titulo}</h3>
              {selectedVideo.descripcion && (
                <p className="text-muted-foreground">{selectedVideo.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
