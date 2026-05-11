"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Tv,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { api, type Transaccion, type Compra } from "@/lib/api"

export default function DashboardPage() {
  const { user } = useAuth()

  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [compras, setCompras] = useState<Compra[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getRecargas().then((d) => setTransacciones(d.transacciones)).catch(() => {}),
      api.getCompras().then(setCompras).catch(() => {}),
    ]).finally(() => setIsLoading(false))
  }, [])

  // Compras aprobadas (campo estado de Compra usa lowercase del backend)
  const comprasAprobadas = compras.filter((c) => c.estado === 'aprobada')

  // Total egresos aprobados (Transaccion usa uppercase: APROBADO, tipo: withdraw)
  const totalGastado = transacciones
    .filter((t) => t.tipo === 'withdraw' && t.estado === 'APROBADO')
    .reduce((sum, t) => sum + t.monto, 0)

  const now = new Date()
  const comprasMes = compras.filter((c) => {
    const d = new Date(c.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const recentActivity = transacciones.slice(0, 4)

  const stats = [
    {
      title: 'Saldo disponible',
      value: `$${(user?.balance ?? 0).toLocaleString('es-CO')}`,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Compras este mes',
      value: String(comprasMes),
      icon: ShoppingBag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total gastado',
      value: `$${totalGastado.toLocaleString('es-CO')}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Compras aprobadas',
      value: String(comprasAprobadas.length),
      icon: Tv,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              ¡Bienvenido{user ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad</p>
          </div>
          <Link href="/dashboard/saldo">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Wallet className="w-4 h-4 mr-2" />
              Recargar saldo
            </Button>
          </Link>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <FadeIn key={stat.title} delay={index * 0.1}>
                <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actividad reciente */}
            <FadeIn delay={0.2} className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Actividad reciente</CardTitle>
                    <CardDescription>Tus últimas transacciones</CardDescription>
                  </div>
                  <Link href="/dashboard/historial">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Ver todo
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Sin actividad reciente.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((t, index) => {
                        const isDeposit = t.tipo === 'deposit'
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isDeposit ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                                {isDeposit ? (
                                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {isDeposit ? 'Recarga de saldo' : 'Compra'}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{t.descripcion}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${isDeposit ? 'text-green-500' : 'text-foreground'}`}>
                                {isDeposit ? '+' : '-'}${t.monto.toLocaleString('es-CO')}
                              </p>
                              <Badge
                                variant="outline"
                                className={
                                  t.estado === 'APROBADO'
                                    ? 'text-xs text-green-500 border-green-500/30'
                                    : t.estado === 'RECHAZADO'
                                    ? 'text-xs text-red-500 border-red-500/30'
                                    : 'text-xs text-yellow-500 border-yellow-500/30'
                                }
                              >
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

            {/* Compras aprobadas */}
            <FadeIn delay={0.3}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Compras aprobadas</CardTitle>
                  <CardDescription>Tus compras de streaming</CardDescription>
                </CardHeader>
                <CardContent>
                  {comprasAprobadas.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">Sin compras aprobadas.</p>
                  ) : (
                    <div className="space-y-4">
                      {comprasAprobadas.slice(0, 4).map((c) => {
                        const serviceName = c.oferta?.servicios?.[0]?.name ?? `Oferta #${c.oferta_id}`
                        const color = c.oferta?.servicios?.[0]?.primary_color ?? '#6B7280'
                        const duracion = c.oferta?.servicios?.[0]?.pivot?.duracion_dias
                        const expiry = duracion
                          ? new Date(new Date(c.created_at).getTime() + duracion * 86400000)
                          : null
                        const diasRestantes = expiry
                          ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86400000))
                          : null
                        return (
                          <div
                            key={c.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: color + '33' }}
                            >
                              <Tv className="w-5 h-5" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{serviceName}</p>
                              <p className="text-xs text-muted-foreground">
                                ${c.precio_compra.toLocaleString('es-CO')}
                              </p>
                            </div>
                            {diasRestantes !== null && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {diasRestantes}d
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <Link href="/dashboard/historial">
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                    >
                      Ver historial completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  )
}
