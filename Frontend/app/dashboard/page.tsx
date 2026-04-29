"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn, CountUp } from "@/components/animations/motion"
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Tv,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

const stats = [
  {
    title: "Saldo disponible",
    value: 150,
    prefix: "$",
    suffix: ".00",
    icon: Wallet,
    trend: "+12%",
    trendUp: true,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Compras este mes",
    value: 5,
    icon: ShoppingBag,
    trend: "+2",
    trendUp: true,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Total gastado",
    value: 89,
    prefix: "$",
    suffix: ".99",
    icon: TrendingUp,
    trend: "Este mes",
    trendUp: false,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Suscripciones activas",
    value: 3,
    icon: Tv,
    trend: "Activas",
    trendUp: true,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const recentActivity = [
  {
    id: 1,
    type: "compra",
    title: "Netflix Premium",
    amount: -11.99,
    date: "Hace 2 horas",
    status: "completado",
  },
  {
    id: 2,
    type: "recarga",
    title: "Recarga de saldo",
    amount: 50.00,
    date: "Hace 1 día",
    status: "completado",
  },
  {
    id: 3,
    type: "compra",
    title: "Disney+ Individual",
    amount: -3.99,
    date: "Hace 3 días",
    status: "completado",
  },
  {
    id: 4,
    type: "compra",
    title: "HBO Max",
    amount: -8.99,
    date: "Hace 5 días",
    status: "completado",
  },
]

const activeSubs = [
  {
    id: 1,
    platform: "Netflix",
    type: "Premium 4K",
    expiresIn: "25 días",
    color: "bg-red-500",
  },
  {
    id: 2,
    platform: "Disney+",
    type: "Individual",
    expiresIn: "18 días",
    color: "bg-blue-600",
  },
  {
    id: 3,
    platform: "HBO Max",
    type: "Completa",
    expiresIn: "12 días",
    color: "bg-purple-600",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="text-muted-foreground">
              Aquí tienes un resumen de tu actividad
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/saldo">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Wallet className="w-4 h-4 mr-2" />
                Recargar saldo
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <FadeIn key={stat.title} delay={index * 0.1}>
            <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      stat.trendUp
                        ? "text-green-500 border-green-500/30"
                        : "text-muted-foreground border-border"
                    }
                  >
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {stat.trend}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.prefix}
                    <CountUp end={stat.value} duration={1.5} />
                    {stat.suffix}
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
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
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.type === "recarga"
                            ? "bg-green-500/10"
                            : "bg-primary/10"
                        }`}
                      >
                        {activity.type === "recarga" ? (
                          <ArrowDownRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          activity.amount > 0
                            ? "text-green-500"
                            : "text-foreground"
                        }`}
                      >
                        {activity.amount > 0 ? "+" : ""}${Math.abs(activity.amount).toFixed(2)}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs text-green-500 border-green-500/30"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Active Subscriptions */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Suscripciones activas</CardTitle>
              <CardDescription>Tus cuentas de streaming</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSubs.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200"
                  >
                    <div className={`w-10 h-10 rounded-lg ${sub.color} flex items-center justify-center`}>
                      <Tv className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{sub.platform}</p>
                      <p className="text-xs text-muted-foreground">{sub.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {sub.expiresIn}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Renovar todas
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
