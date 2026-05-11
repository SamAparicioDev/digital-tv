"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import {
  Monitor, Search, RefreshCw, Loader2, AlertCircle, Package, Check, X,
  Layers, Clock, ShoppingBag, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Oferta } from "@/lib/api"

export default function AdminPantallasPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getOfertas()
      setOfertas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando ofertas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggleActive = async (oferta: Oferta) => {
    try {
      const updated = await api.updateOferta(oferta.id, { is_active: !oferta.is_active })
      setOfertas((prev) => prev.map((o) => o.id === updated.id ? updated : o))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error actualizando oferta')
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await api.deleteOferta(id)
      setOfertas((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando oferta')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = ofertas.filter((o) => {
    const label = o.servicios.map((s) => s.name).join(' ').toLowerCase()
    const matchSearch = label.includes(searchQuery.toLowerCase())
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? o.is_active : !o.is_active)
    return matchSearch && matchActive
  })

  const totalStock = ofertas.reduce((s, o) => s + o.stock, 0)
  const activas = ofertas.filter((o) => o.is_active).length

  return (
    <Suspense>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Ofertas</h1>
              <p className="text-muted-foreground">Paquetes de streaming disponibles para la venta</p>
            </div>
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total ofertas', value: ofertas.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Activas', value: activas, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Inactivas', value: ofertas.length - activas, icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Stock total', value: totalStock, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", s.bg)}>
                      <s.icon className={cn("w-5 h-5", s.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xl font-bold text-foreground">{s.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Filters */}
        <FadeIn delay={0.2}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por servicio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Todas' },
                    { key: 'active', label: 'Activas' },
                    { key: 'inactive', label: 'Inactivas' },
                  ].map((f) => (
                    <Button
                      key={f.key}
                      variant={filterActive === f.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterActive(f.key as typeof filterActive)}
                      className={cn(filterActive === f.key ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary')}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Offers grid */}
        <FadeIn delay={0.3}>
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
            <div className="text-center text-muted-foreground py-12">
              <Monitor className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No hay ofertas registradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((oferta, index) => {
                const serviceName = oferta.servicios.length > 0
                  ? oferta.servicios.map((s) => s.name).join(' + ')
                  : `Oferta #${oferta.id}`
                const color = oferta.servicios[0]?.primary_color ?? '#6B7280'

                return (
                  <Card
                    key={oferta.id}
                    className={cn(
                      "bg-card border-border overflow-hidden transition-all duration-200",
                      !oferta.is_active && "opacity-60"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="h-1" style={{ backgroundColor: color }} />
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{serviceName}</h3>
                          <p className="text-2xl font-bold text-primary mt-1">
                            ${oferta.precio.toLocaleString('es-CO')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            oferta.is_active ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"
                          )}>
                            {oferta.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                          {oferta.cuenta_completa && (
                            <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                              Cuenta completa
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-3">
                        {oferta.servicios.map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-sm text-muted-foreground bg-secondary/30 rounded px-3 py-1.5">
                            <span className="font-medium text-foreground">{s.name}</span>
                            <span className="flex items-center gap-2">
                              <Monitor className="w-3 h-3" />
                              {s.pivot.numero_perfiles} perfil{s.pivot.numero_perfiles > 1 ? 'es' : ''}
                              <Clock className="w-3 h-3 ml-1" />
                              {s.pivot.duracion_dias}d
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ShoppingBag className="w-4 h-4" />
                          Stock: <span className={cn("font-semibold ml-1", oferta.stock > 0 ? 'text-foreground' : 'text-red-500')}>{oferta.stock}</span>
                        </span>
                        {oferta.garantia_dias > 0 && (
                          <span className="text-muted-foreground text-xs">
                            Garantía {oferta.garantia_dias} días
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleToggleActive(oferta)}
                        >
                          {oferta.is_active ? <><X className="w-4 h-4 mr-1" />Desactivar</> : <><Check className="w-4 h-4 mr-1" />Activar</>}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(oferta.id)}
                          disabled={deletingId === oferta.id}
                        >
                          {deletingId === oferta.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </FadeIn>
      </div>
    </Suspense>
  )
}
