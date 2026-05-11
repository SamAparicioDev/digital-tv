import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/motion"
import { Play, Sparkles, ChevronDown } from "lucide-react"

interface HeroProps {
  onLoginClick: () => void
}

export function Hero({ onLoginClick }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <Image
            src="/banner.png"
            alt="Banner de entretenimiento"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background/70" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_25%)]" />
        <div className="absolute top-16 left-8 w-52 h-52 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-10 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-20 text-center">

        <FadeIn direction="up" delay={0.2}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
            Tu entretenimiento
            <br />
            <span className="text-primary">sin límites</span>
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Accede a las mejores plataformas de streaming a precios increíbles.
            Netflix, Disney+, HBO Max y mucho más en un solo lugar.
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onLoginClick}
              className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Comenzar ahora
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg border-border hover:border-primary hover:text-primary transition-all duration-300 bg-transparent"
              onClick={() => {
                document.getElementById("promociones")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Ver promociones
            </Button>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.5}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "50K+", label: "Usuarios activos" },
              { value: "15+", label: "Plataformas" },
              { value: "24/7", label: "Soporte" },
              { value: "99%", label: "Satisfacción" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FadeIn delay={1}>
          <button
            onClick={() => {
              document.getElementById("promociones")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group"
          >
            <span className="text-xs uppercase tracking-wider">Explorar</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </FadeIn>
      </div>
    </section>
  )
}
