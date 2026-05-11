"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, Users, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { FadeIn } from "@/components/animations/motion"
import { api, type AdminTransaccion } from "@/lib/api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function buildMonthlyData(txs: AdminTransaccion[]) {
  const map: Record<string, { ingresos: number; ventas: number; count: number }> = {}
  MONTHS.forEach((m) => { map[m] = { ingresos: 0, ventas: 0, count: 0 } })

  txs.forEach((t) => {
    if (t.estado !== 'APROBADO') return
    const month = MONTHS[new Date(t.created_at).getMonth()]
    if (!map[month]) return
    map[month].count++
    if (t.tipo === 'deposit') map[month].ingresos += t.monto
    if (t.tipo === 'withdraw') map[month].ventas += t.monto
  })

  return MONTHS.map((name) => ({ name, ...map[name] }))
}

function buildServiceData(txs: AdminTransaccion[]) {
  const map: Record<string, number> = {}
  txs.forEach((t) => {
    if (t.estado !== 'APROBADO' || t.tipo !== 'withdraw') return
    const name = t.compra?.oferta?.servicios?.[0]?.name ?? 'Otros'
    map[name] = (map[name] ?? 0) + t.monto
  })
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, color: ['#EAB308','#22c55e','#3b82f6','#a855f7','#f43f5e'][i] ?? '#6B7280' }))
}

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminReportesPage() {
  const [txs, setTxs] = useState<AdminTransaccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getAdminTransacciones()
      setTxs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando transacciones')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Computed
  const aprobadas = txs.filter((t) => t.estado === 'APROBADO')
  const totalIngresos = aprobadas.filter((t) => t.tipo === 'deposit').reduce((s, t) => s + t.monto, 0)
  const totalVentas = aprobadas.filter((t) => t.tipo === 'withdraw').reduce((s, t) => s + t.monto, 0)
  const totalTransacciones = txs.length
  const usuarios = new Set(txs.map((t) => t.wallet?.user?.id).filter(Boolean)).size

  const monthlyData = buildMonthlyData(txs)
  const serviceData = buildServiceData(txs)

  const summaryCards = [
    { title: 'Ingresos totales (aprobados)', value: `$${totalIngresos.toLocaleString('es-CO')}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', trend: 'deposit aprobados' },
    { title: 'Ventas totales (aprobadas)', value: `$${totalVentas.toLocaleString('es-CO')}`, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10', trend: 'withdraw aprobados' },
    { title: 'Total transacciones', value: String(totalTransacciones), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'todas' },
    { title: 'Usuarios con actividad', value: String(usuarios), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'únicos' },
  ]

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reportes</h1>
            <p className="text-muted-foreground">Estadísticas reales de transacciones</p>
          </div>
          <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.1}>
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className={`p-2 rounded-lg ${card.bg} w-fit mb-4`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Monthly charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.2}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Ingresos vs. Ventas por mes</CardTitle>
                  <CardDescription>Solo transacciones aprobadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip {...CHART_STYLE} formatter={(v: number) => [`$${v.toLocaleString('es-CO')}`, '']} />
                        <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#22c55e" fillOpacity={1} fill="url(#gIngresos)" strokeWidth={2} />
                        <Area type="monotone" dataKey="ventas" name="Ventas" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#gVentas)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Ventas por servicio</CardTitle>
                  <CardDescription>Top 5 servicios más vendidos (monto aprobado)</CardDescription>
                </CardHeader>
                <CardContent>
                  {serviceData.length > 0 ? (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={serviceData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {serviceData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip {...CHART_STYLE} formatter={(v: number) => [`$${v.toLocaleString('es-CO')}`, 'Monto']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                      No hay ventas aprobadas con datos de servicio
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Bar chart */}
          <FadeIn delay={0.4}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Volumen mensual de transacciones</CardTitle>
                <CardDescription>Cantidad de transacciones aprobadas por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                      <Tooltip {...CHART_STYLE} />
                      <Bar dataKey="count" name="Transacciones" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* State breakdown */}
          <FadeIn delay={0.5}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Estado de transacciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Aprobadas', count: txs.filter((t) => t.estado === 'APROBADO').length, className: 'text-green-500' },
                    { label: 'Pendientes', count: txs.filter((t) => t.estado === 'PENDIENTE').length, className: 'text-yellow-500' },
                    { label: 'Rechazadas', count: txs.filter((t) => t.estado === 'RECHAZADO').length, className: 'text-red-500' },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-lg bg-secondary/30">
                      <p className={`text-3xl font-bold ${s.className}`}>{s.count}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  )
}
