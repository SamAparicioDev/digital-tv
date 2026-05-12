"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import {
  TrendingUp, DollarSign, ShoppingCart, Users, RefreshCw, Loader2, AlertCircle, Calendar, ChevronLeft, ChevronRight,
} from "lucide-react"
import { FadeIn } from "@/components/animations/motion"
import { api, type AdminTransaccion } from "@/lib/api"
import { formatCOP, cn } from "@/lib/utils"

const MONTHS_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Paleta clara/luminosa, visible sobre fondo oscuro pero sin saturar
const PIE_COLORS = ['#FCD34D', '#A7F3D0', '#93C5FD', '#DDD6FE', '#FCA5A5', '#A5F3FC']

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #404040',
    borderRadius: '8px',
    color: '#fff',
  },
  labelStyle: { color: '#fff' },
  itemStyle: { color: '#fff' },
}

export default function AdminReportesPage() {
  const [txs, setTxs] = useState<AdminTransaccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtro de mes para la tabla — null = todos los meses
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState<number | 'all'>(today.getMonth())

  const load = async () => {
    setIsLoading(true); setError(null)
    try {
      const data = await api.getAdminTransacciones()
      setTxs(data)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error cargando transacciones') }
    finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  // Solo ventas (withdraw) aprobadas
  const ventasAprobadas = useMemo(() =>
    txs.filter(t => t.tipo === 'withdraw' && t.estado === 'APROBADO'),
    [txs]
  )

  // Filtrar ventas por año y mes seleccionado
  const ventasFiltradas = useMemo(() => {
    return ventasAprobadas.filter(t => {
      const d = new Date(t.created_at)
      if (d.getFullYear() !== year) return false
      if (month !== 'all' && d.getMonth() !== month) return false
      return true
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [ventasAprobadas, year, month])

  // Stats del mes filtrado
  const totalVentasMes = ventasFiltradas.reduce((s, t) => s + Number(t.monto), 0)
  const cantidadVentasMes = ventasFiltradas.length

  // Cliente que más compró en el período filtrado
  const topCliente = useMemo(() => {
    const map: Record<string, { nombre: string; total: number; count: number }> = {}
    ventasFiltradas.forEach(t => {
      const id = t.wallet?.user?.id
      const name = t.wallet?.user?.name ?? 'Anónimo'
      if (!id) return
      if (!map[id]) map[id] = { nombre: name, total: 0, count: 0 }
      map[id].total += Number(t.monto)
      map[id].count++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)[0] ?? null
  }, [ventasFiltradas])

  // Cuenta más vendida
  const topCuenta = useMemo(() => {
    const map: Record<string, { nombre: string; total: number; count: number }> = {}
    ventasFiltradas.forEach(t => {
      const name = t.compra?.oferta?.servicios?.[0]?.name ?? 'Otros'
      if (!map[name]) map[name] = { nombre: name, total: 0, count: 0 }
      map[name].total += Number(t.monto)
      map[name].count++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)[0] ?? null
  }, [ventasFiltradas])

  // ── Datos para gráficos ──────────────────────────────────────────────────────

  // Bar chart: ventas por mes del año seleccionado
  const ventasPorMes = useMemo(() => {
    const arr = MONTHS_FULL.map((name, i) => ({ name: name.slice(0, 3), monto: 0, count: 0, mes: i }))
    ventasAprobadas.forEach(t => {
      const d = new Date(t.created_at)
      if (d.getFullYear() !== year) return
      arr[d.getMonth()].monto += Number(t.monto)
      arr[d.getMonth()].count++
    })
    return arr
  }, [ventasAprobadas, year])

  // Pie chart: ventas por servicio (en el período filtrado)
  const ventasPorServicio = useMemo(() => {
    const map: Record<string, number> = {}
    ventasFiltradas.forEach(t => {
      const name = t.compra?.oferta?.servicios?.[0]?.name ?? 'Otros'
      map[name] = (map[name] ?? 0) + Number(t.monto)
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i] ?? '#6B7280' }))
  }, [ventasFiltradas])

  const aniosDisponibles = useMemo(() => {
    const set = new Set<number>([today.getFullYear()])
    ventasAprobadas.forEach(t => set.add(new Date(t.created_at).getFullYear()))
    return Array.from(set).sort((a, b) => b - a)
  }, [ventasAprobadas])

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reportes de ventas</h1>
            <p className="text-muted-foreground">Tabla de ventas y resumen gráfico</p>
          </div>
          <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p>
          <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
        </div>
      ) : (
        <>
          {/* Resumen rápido del período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FadeIn delay={0.1}>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4"><DollarSign className="w-5 h-5 text-primary" /></div>
                  <p className="text-sm text-muted-foreground">Total vendido</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCOP(totalVentasMes)}</p>
                  <p className="text-xs text-muted-foreground mt-1">en el período filtrado</p>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.15}>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-4"><ShoppingCart className="w-5 h-5 text-green-500" /></div>
                  <p className="text-sm text-muted-foreground"># de ventas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{cantidadVentasMes}</p>
                  <p className="text-xs text-muted-foreground mt-1">transacciones aprobadas</p>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-4"><Users className="w-5 h-5 text-blue-500" /></div>
                  <p className="text-sm text-muted-foreground">Cliente top</p>
                  <p className="text-base font-bold text-foreground mt-1 truncate">{topCliente?.nombre ?? '—'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {topCliente ? `${formatCOP(topCliente.total)} · ${topCliente.count} compras` : 'Sin datos'}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.25}>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-4"><TrendingUp className="w-5 h-5 text-purple-500" /></div>
                  <p className="text-sm text-muted-foreground">Cuenta más vendida</p>
                  <p className="text-base font-bold text-foreground mt-1 truncate">{topCuenta?.nombre ?? '—'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {topCuenta ? `${formatCOP(topCuenta.total)} · ${topCuenta.count} ventas` : 'Sin datos'}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Tabla de ventas — full width */}
          <FadeIn delay={0.3}>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Ventas — {month === 'all' ? `Todo ${year}` : `${MONTHS_FULL[month as number]} ${year}`}
                    </CardTitle>
                    <CardDescription>{ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''} en el período</CardDescription>
                  </div>

                  {/* Selector año + mes */}
                  <div className="flex items-center gap-2">
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      {aniosDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent"
                      onClick={() => setMonth(m => m === 'all' ? 11 : m === 0 ? 'all' : (m as number) - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <select value={String(month)} onChange={e => setMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                      <option value="all">Todos los meses</option>
                      {MONTHS_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent"
                      onClick={() => setMonth(m => m === 'all' ? 0 : m === 11 ? 'all' : (m as number) + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ventasFiltradas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No hay ventas en este período</p>
                ) : (
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Servicio comprado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ventasFiltradas.map(t => {
                          const fecha = new Date(t.created_at)
                          const servicio = t.compra?.oferta?.servicios?.[0]?.name ?? 'Servicio'
                          return (
                            <TableRow key={t.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="font-semibold text-sm text-primary">
                                      {(t.wallet?.user?.name ?? '?').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-medium text-foreground">{t.wallet?.user?.name ?? 'Usuario'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{t.wallet?.user?.email ?? '—'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{servicio}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                <span className="ml-2 text-xs opacity-60">
                                  {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-primary">
                                {formatCOP(Number(t.monto))}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow className="bg-secondary/30 hover:bg-secondary/30 font-bold">
                          <TableCell colSpan={4} className="text-right text-foreground">Total {month === 'all' ? `año ${year}` : `del mes`}:</TableCell>
                          <TableCell className="text-right text-primary text-base">{formatCOP(totalVentasMes)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Gráficos abajo en 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart: ventas por mes del año */}
            <FadeIn delay={0.4}>
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle>Ventas por mes — {year}</CardTitle>
                  <CardDescription>Monto facturado mes a mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ventasPorMes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" opacity={0.4} />
                        <XAxis dataKey="name" stroke="#d4d4d4" fontSize={11} />
                        <YAxis stroke="#d4d4d4" fontSize={11}
                          tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          {...CHART_STYLE}
                          cursor={{ fill: '#ffffff10' }}
                          formatter={(v: number) => [formatCOP(v), 'Vendido']}
                        />
                        <Bar dataKey="monto" name="Ventas" fill="#FFFFFF" radius={[4, 4, 0, 0]} opacity={0.9} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Pie chart: distribución por servicio */}
            <FadeIn delay={0.45}>
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle>Distribución por servicio</CardTitle>
                  <CardDescription>Ventas por servicio en el período seleccionado</CardDescription>
                </CardHeader>
                <CardContent>
                  {ventasPorServicio.length > 0 ? (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={ventasPorServicio} dataKey="value" nameKey="name"
                            cx="50%" cy="50%" outerRadius={100}
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#d4d4d4' }}
                            stroke="#1a1a1a"
                            strokeWidth={2}>
                            {ventasPorServicio.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip {...CHART_STYLE} formatter={(v: number) => [formatCOP(v), 'Monto']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                      Sin datos para este período
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  )
}
