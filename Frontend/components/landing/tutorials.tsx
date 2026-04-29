"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import { Play, Clock, Eye, X, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const tutorials = [
  {
    id: 1,
    title: "Cómo activar tu cuenta de Netflix",
    description: "Guía paso a paso para configurar tu nueva cuenta de Netflix",
    duration: "5:30",
    views: "12.5K",
    thumbnail: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=340&fit=crop",
    videoUrl: "#",
    category: "Configuración",
  },
  {
    id: 2,
    title: "Configurar perfiles en Disney+",
    description: "Aprende a crear y personalizar perfiles para toda la familia",
    duration: "4:15",
    views: "8.2K",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=340&fit=crop",
    videoUrl: "#",
    category: "Configuración",
  },
  {
    id: 3,
    title: "Descargas offline en HBO Max",
    description: "Descarga tus series favoritas para ver sin conexión",
    duration: "6:45",
    views: "15.1K",
    thumbnail: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=600&h=340&fit=crop",
    videoUrl: "#",
    category: "Funciones",
  },
  {
    id: 4,
    title: "Recargar saldo en DigitalTv",
    description: "Tutorial completo sobre métodos de pago y recargas",
    duration: "3:20",
    views: "22.8K",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=340&fit=crop",
    videoUrl: "#",
    category: "Pagos",
  },
]

export function Tutorials() {
  const [selectedVideo, setSelectedVideo] = useState<typeof tutorials[0] | null>(null)

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
              Aprende a sacar el máximo provecho de tus cuentas de streaming con nuestros tutoriales
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial, index) => (
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
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-48 md:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
                    <img
                      src={tutorial.thumbnail || "/placeholder.svg"}
                      alt={tutorial.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {tutorial.duration}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    <Badge
                      variant="outline"
                      className="mb-2 text-xs border-primary/50 text-primary"
                    >
                      {tutorial.category}
                    </Badge>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {tutorial.views} vistas
                      </span>
                    </div>
                  </div>
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
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent"
            >
              Ver todos los tutoriales
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-card rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Video Placeholder */}
            <div className="aspect-video bg-secondary relative">
              <img
                src={selectedVideo.thumbnail || "/placeholder.svg"}
                alt={selectedVideo.title}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Video reproductor (demo)
                </p>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {selectedVideo.title}
              </h3>
              <p className="text-muted-foreground">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
