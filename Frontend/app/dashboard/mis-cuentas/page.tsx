"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import {
  Tv, Eye, EyeOff, Copy, Check, Loader2, RefreshCw, AlertCircle, KeyRound, Calendar, Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type MiCuenta } from "@/lib/api"

export default function MisCuentasPage() {
  const [cuentas, setCuentas] = useState<MiCuenta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPassIds, setShowPassIds] = useState<Set<number>>(new Set())
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getMisCuentas()
      setCuentas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando cuentas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const togglePass = (id: number) =>
    setShowPassIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const vigentes = cuentas.filter(c => c.vigente)
  const vencidas = cuentas.filter(c => !c.vigente)

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mis Cuentas</h1>
            <p className="text-muted-foreground">Credenciales de los servicios que has adquirido</p>
          </div>
          <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Actualizar
          </Button>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p>
          <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
        </div>
      ) : cuentas.length === 0 ? (
        <FadeIn>
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Tv className="w-16 h-16 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-lg font-semibold text-foreground mb-1">Sin cuentas activas</p>
              <p className="text-muted-foreground text-sm">
                Cuando el administrador apruebe tu compra, tus credenciales aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <>
          {vigentes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activas ({vigentes.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vigentes.map((c, i) => (
                  <FadeIn key={c.id} delay={i * 0.08}>
                    <CuentaCard cuenta={c} showPass={showPassIds.has(c.id)}
                      onTogglePass={() => togglePass(c.id)}
                      onCopy={copy} copiedField={copiedField} />
                  </FadeIn>
                ))}
              </div>
            </div>
          )}

          {vencidas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vencidas ({vencidas.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                {vencidas.map((c, i) => (
                  <FadeIn key={c.id} delay={i * 0.08}>
                    <CuentaCard cuenta={c} showPass={showPassIds.has(c.id)}
                      onTogglePass={() => togglePass(c.id)}
                      onCopy={copy} copiedField={copiedField} />
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Card individual ──────────────────────────────────────────────────────────

function CuentaCard({
  cuenta: c,
  showPass,
  onTogglePass,
  onCopy,
  copiedField,
}: {
  cuenta: MiCuenta
  showPass: boolean
  onTogglePass: () => void
  onCopy: (text: string, field: string) => void
  copiedField: string | null
}) {
  const emailKey = `${c.id}-email`
  const passKey = `${c.id}-pass`
  const pinKey = `${c.id}-pin`

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: c.servicio_color }} />
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: c.servicio_color }}>
              {c.servicio.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{c.servicio}</p>
              <Badge variant="outline" className={cn("text-xs mt-0.5",
                c.tipo === 'cuenta_completa'
                  ? 'text-blue-400 border-blue-400/30'
                  : 'text-purple-400 border-purple-400/30')}>
                {c.tipo === 'cuenta_completa' ? 'Cuenta completa' : `Perfil: ${c.perfil?.nombre}`}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("flex items-center gap-1 text-xs font-medium",
              c.vigente ? 'text-green-500' : 'text-red-400')}>
              <Clock className="w-3 h-3" />
              {c.vigente ? `${c.dias_restantes}d restantes` : 'Vencido'}
            </div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            <KeyRound className="w-3 h-3 inline mr-1" />Credenciales
          </p>

          {/* Email */}
          {c.email && (
            <CredRow label="Email / Usuario" value={c.email} fieldKey={emailKey}
              copiedField={copiedField} onCopy={onCopy} />
          )}

          {/* Contraseña (solo cuenta completa) */}
          {c.tipo === 'cuenta_completa' && c.password && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Contraseña</p>
                <p className="text-sm font-mono text-foreground truncate">
                  {showPass ? c.password : '••••••••••'}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={onTogglePass} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => onCopy(c.password!, passKey)}
                  className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  {copiedField === passKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* PIN de perfil */}
          {c.tipo === 'perfil' && c.perfil?.pin && (
            <CredRow label="PIN del perfil" value={c.perfil.pin} fieldKey={pinKey}
              copiedField={copiedField} onCopy={onCopy} />
          )}

          {/* Si es perfil y no hay PIN */}
          {c.tipo === 'perfil' && !c.perfil?.pin && (
            <p className="text-xs text-muted-foreground">Sin PIN configurado</p>
          )}
        </div>

        {/* Vigencia */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Desde {new Date(c.vigencia_desde).toLocaleDateString('es-CO')}
          </span>
          <span className={cn(c.vigente ? 'text-foreground' : 'text-red-400')}>
            Hasta {new Date(c.vigencia_hasta).toLocaleDateString('es-CO')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function CredRow({
  label, value, fieldKey, copiedField, onCopy,
}: {
  label: string; value: string; fieldKey: string
  copiedField: string | null; onCopy: (v: string, k: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-mono text-foreground truncate">{value}</p>
      </div>
      <button onClick={() => onCopy(value, fieldKey)}
        className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex-shrink-0">
        {copiedField === fieldKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}
