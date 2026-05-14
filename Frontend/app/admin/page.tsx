"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/motion"
import {
  Users, DollarSign, ShoppingCart, Activity,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts"
import { api, type AdminTransaccion, type WalletWithUser } from "@/lib/api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { month: 'short' })
}

function groupByMonth(transacciones: AdminTransaccion[]) {
  const map: Record<string, { ingresos: number; ventas: number }> = {}
  transacciones.forEach((t) => {
    const label = monthLabel(t.created_at)
    if (!map[label]) map[label] = { ingresos: 0, ventas: 0 }
    if (t.tipo === 'deposit' && t.estado === 'APROBADO') map[label].ingresos += t.monto
    if (t.tipo === 'withdraw' && t.estado === 'APROBADO') map[label].ventas += t.monto
  })
  return Object.entries(map).map(([name, v]) => ({ name, ...v }))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [transacciones, setTransacciones] = useState<AdminTransaccion[]>([])
  const [wallets, setWallets] = useState<WalletWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    try {
      const [tx, wl] = await Promise.all([
        api.getAdminTransacciones().catch(() => [] as AdminTransaccion[]),
        api.getWallets().catch(() => [] as WalletWithUser[]),
      ])
      setTransacciones(tx)
      setWallets(wl)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalUsuarios = wallets.length
  const totalIngresos = transacciones
    .filter((t) => t.tipo === 'deposit' && t.estado === 'APROBADO')
    .reduce((s, t) => s + t.monto, 0)
  const totalVentas = transacciones
    .filter((t) => t.tipo === 'withdraw' && t.estado === 'APROBADO')
    .reduce((s, t) => s + t.monto, 0)
  const totalPendientes = transacciones.filter((t) => t.estado === 'PENDIENTE').length

  const stats = [
    {
      title: "Usuarios registrados",
      value: totalUsuarios,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      format: (v: number) => String(v),
    },
    {
      title: "Ingresos aprobados",
      value: totalIngresos,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      format: (v: number) => `$${v.toLocaleString('es-CO')}`,
    },
    {
      title: "Ventas aprobadas",
      value: totalVentas,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
      format: (v: number) => `$${v.toLocaleString('es-CO')}`,
    },
    {
      title: "Pendientes de revisión",
      value: totalPendientes,
      icon: Activity,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      format: (v: number) => String(v),
    },
  ]

  const chartData = groupByMonth(transacciones)
  const recentActivity = transacciones.slice(0, 8)

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Resumen general de la plataforma</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={isLoading} className="flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <FadeIn key={stat.title} delay={index * 0.1}>
                <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`p-2 rounded-lg ${stat.bgColor} w-fit mb-4`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.format(stat.value)}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.2}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Flujo de transacciones</CardTitle>
                  <CardDescription>Ingresos y ventas aprobadas por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                            formatter={(v: number) => [`$${v.toLocaleString('es-CO')}`, '']}
                          />
                          <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={2} />
                          <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#22c55e" fillOpacity={0.1} fill="#22c55e" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Sin datos de transacciones aún
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Montos por mes</CardTitle>
                  <CardDescription>Comparativa ingresos vs. ventas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                            formatter={(v: number) => [`$${v.toLocaleString('es-CO')}`, '']}
                          />
                          <Bar dataKey="ingresos" name="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ventas" name="Ventas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Sin datos de transacciones aún
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Recent activity */}
          <FadeIn delay={0.4}>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <CardTitle>Actividad reciente</CardTitle>
                </div>
                <CardDescription>Últimas transacciones en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay transacciones registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((t) => {
                      const isDeposit = t.tipo === 'deposit'
                      return (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isDeposit ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                              {t.wallet?.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{t.wallet?.user?.name ?? 'Usuario'}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{t.descripcion}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-semibold ${isDeposit ? 'text-green-500' : 'text-foreground'}`}>
                              {isDeposit ? '+' : '-'}${t.monto.toLocaleString('es-CO')}
                            </p>
                            <Badge variant="outline" className={
                              t.estado === 'APROBADO' ? 'text-xs text-green-500 border-green-500/30' :
                              t.estado === 'RECHAZADO' ? 'text-xs text-red-500 border-red-500/30' :
                              'text-xs text-yellow-500 border-yellow-500/30'
                            }>
                              {t.estado === 'APROBADO' ? 'Aprobado' : t.estado === 'RECHAZADO' ? 'Rechazado' : 'Pendiente'}
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
        </>
      )}
    </div>
  )
}
