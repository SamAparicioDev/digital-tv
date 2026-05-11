"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FadeIn } from "@/components/animations/motion"
import {
  History,
  Search,
  Filter,
  ShoppingBag,
  ArrowDownRight,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Transaccion } from "@/lib/api"
import Loading from "./loading"

// Mapea el tipo del backend al tipo de display
function displayType(t: Transaccion): 'recarga' | 'compra' {
  return t.tipo === 'deposit' ? 'recarga' : 'compra'
}

function displayStatus(estado: Transaccion['estado']): string {
  if (estado === 'APROBADO') return 'Aprobada'
  if (estado === 'RECHAZADO') return 'Rechazada'
  return 'Pendiente'
}

function statusClass(estado: Transaccion['estado']): string {
  if (estado === 'APROBADO') return 'text-green-500 border-green-500/30'
  if (estado === 'RECHAZADO') return 'text-red-500 border-red-500/30'
  return 'text-yellow-500 border-yellow-500/30'
}

export default function HistorialPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'recarga' | 'compra'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getRecargas()
      setTransacciones(data.transacciones)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando historial')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filteredTransacciones = transacciones.filter((t) => {
    const type = displayType(t)
    if (filter !== 'all' && type !== filter) return false
    if (searchQuery && !t.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) && !t.referencia?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalCompras = transacciones
    .filter((t) => t.tipo === 'withdraw' && t.estado === 'APROBADO')
    .reduce((sum, t) => sum + t.monto, 0)

  const totalRecargas = transacciones
    .filter((t) => t.tipo === 'deposit' && t.estado === 'APROBADO')
    .reduce((sum, t) => sum + t.monto, 0)

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Historial de transacciones
              </h1>
              <p className="text-muted-foreground">Revisa todas tus recargas y compras</p>
            </div>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              onClick={loadData}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FadeIn delay={0.1}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total transacciones</p>
                    <p className="text-xl font-bold text-foreground">{transacciones.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <ShoppingBag className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total compras (aprobadas)</p>
                    <p className="text-xl font-bold text-foreground">
                      ${totalCompras.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ArrowDownRight className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total recargas (aprobadas)</p>
                    <p className="text-xl font-bold text-foreground">
                      ${totalRecargas.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Filters */}
        <FadeIn delay={0.25}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descripción o referencia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  {[
                    { key: 'all', label: 'Todas' },
                    { key: 'recarga', label: 'Recargas' },
                    { key: 'compra', label: 'Compras' },
                  ].map((f) => (
                    <Button
                      key={f.key}
                      variant={filter === f.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(f.key as typeof filter)}
                      className={cn(
                        'transition-all duration-200',
                        filter === f.key
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:border-primary hover:text-primary'
                      )}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Transactions List */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>
                Mostrando {filteredTransacciones.length} de {transacciones.length} transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={loadData}>Reintentar</Button>
                </div>
              ) : filteredTransacciones.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No hay transacciones registradas.</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransacciones.map((t, index) => {
                    const type = displayType(t)
                    const isIngreso = t.tipo === 'deposit'
                    return (
                      <div
                        key={t.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all duration-200 gap-4"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-lg", isIngreso ? "bg-green-500/10" : "bg-primary/10")}>
                            {isIngreso ? (
                              <ArrowDownRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {isIngreso ? 'Recarga de saldo' : 'Compra'}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{t.descripcion}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(t.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              {t.referencia && <span className="text-primary">#{t.referencia}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                          <p className={cn(
                            "text-lg font-bold",
                            isIngreso ? "text-green-500" : "text-foreground"
                          )}>
                            {isIngreso ? '+' : '-'}${t.monto.toLocaleString('es-CO')}
                          </p>
                          <Badge variant="outline" className={statusClass(t.estado)}>
                            {displayStatus(t.estado)}
                          </Badge>
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
    </Suspense>
  )
}
