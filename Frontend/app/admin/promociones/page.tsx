"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import {
  Percent, RefreshCw, Loader2, AlertCircle, Search, Calendar, Check, X, Trash2, Eye, EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Descuento } from "@/lib/api"

export default function AdminPromocionesPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getDescuentos()
      setDescuentos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando descuentos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await api.deleteDescuento(id)
      setDescuentos((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando descuento')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = descuentos.filter((d) =>
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.codigo ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activos = descuentos.filter((d) => d.is_active).length

  const isVigente = (d: Descuento) => {
    const now = new Date()
    const inicio = new Date(d.fecha_inicio)
    const fin = d.fecha_fin ? new Date(d.fecha_fin) : null
    return inicio <= now && (!fin || fin >= now)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Descuentos</h1>
            <p className="text-muted-foreground">Descuentos aplicados por rol en la plataforma</p>
          </div>
          <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total descuentos', value: descuentos.length, icon: Percent, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Activos', value: activos, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Inactivos', value: descuentos.length - activos, icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.1}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", s.bg)}>
                    <s.icon className={cn("w-5 h-5", s.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Search */}
      <FadeIn delay={0.2}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* List */}
      <FadeIn delay={0.3}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Descuentos</CardTitle>
            <CardDescription>{filtered.length} descuentos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No hay descuentos registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((d, index) => {
                  const vigente = isVigente(d)
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border transition-all duration-200 gap-4",
                        d.is_active && vigente ? "border-border" : "border-border/50 opacity-60"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                          <Percent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{d.nombre}</h3>
                            {d.codigo && (
                              <Badge variant="outline" className="text-xs font-mono">{d.codigo}</Badge>
                            )}
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              d.is_active && vigente ? "text-green-500 border-green-500/30" : "text-muted-foreground"
                            )}>
                              {d.is_active ? (vigente ? 'Activo' : 'Vencido') : 'Inactivo'}
                            </Badge>
                            {d.es_recurrente && (
                              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                                Recurrente
                              </Badge>
                            )}
                          </div>
                          {d.descripcion && (
                            <p className="text-sm text-muted-foreground truncate">{d.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Desde {new Date(d.fecha_inicio).toLocaleDateString('es-CO')}
                            </span>
                            {d.fecha_fin && (
                              <span>hasta {new Date(d.fecha_fin).toLocaleDateString('es-CO')}</span>
                            )}
                          </div>

                          {/* Roles asignados */}
                          {d.roles && d.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {d.roles.map((r) => (
                                <Badge key={r.id} variant="secondary" className="text-xs">
                                  {r.nombre} — {r.pivot.valor_descuento}
                                  {r.pivot.tipo_descuento === 'porcentaje' ? '%' : ' COP'}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={d.is_active ? 'Activo' : 'Inactivo'}
                        >
                          {d.is_active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(d.id)}
                          disabled={deletingId === d.id}
                        >
                          {deletingId === d.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
