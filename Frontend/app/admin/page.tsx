"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn, CountUp } from "@/components/animations/motion"
import { 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const stats = [
  {
    title: "Usuarios totales",
    value: 12458,
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Ingresos del mes",
    value: 48250,
    prefix: "$",
    change: "+8.2%",
    changeType: "positive",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Ventas del mes",
    value: 3842,
    change: "+15.3%",
    changeType: "positive",
    icon: ShoppingCart,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Tasa de conversión",
    value: 24.8,
    suffix: "%",
    change: "-2.1%",
    changeType: "negative",
    icon: TrendingUp,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const revenueData = [
  { name: "Ene", ingresos: 4000, ventas: 240 },
  { name: "Feb", ingresos: 3000, ventas: 198 },
  { name: "Mar", ingresos: 5000, ventas: 300 },
  { name: "Abr", ingresos: 4500, ventas: 278 },
  { name: "May", ingresos: 6000, ventas: 389 },
  { name: "Jun", ingresos: 5500, ventas: 349 },
  { name: "Jul", ingresos: 7000, ventas: 430 },
]

const platformSales = [
  { name: "Netflix", ventas: 450, color: "#E50914" },
  { name: "Disney+", ventas: 320, color: "#113CCF" },
  { name: "HBO Max", ventas: 280, color: "#8B5CF6" },
  { name: "Prime", ventas: 200, color: "#00A8E1" },
  { name: "Spotify", ventas: 180, color: "#1DB954" },
]

const recentActivity = [
  { id: 1, user: "Carlos M.", action: "Nueva compra", item: "Netflix Premium", time: "Hace 5 min", amount: "+$11.99" },
  { id: 2, user: "Ana R.", action: "Recarga saldo", item: "$50.00", time: "Hace 12 min", amount: "+$50.00" },
  { id: 3, user: "Luis P.", action: "Nueva compra", item: "Disney+ Bundle", time: "Hace 25 min", amount: "+$14.99" },
  { id: 4, user: "María S.", action: "Registro", item: "Nuevo usuario", time: "Hace 32 min", amount: "" },
  { id: 5, user: "Pedro G.", action: "Nueva compra", item: "HBO Max", time: "Hace 45 min", amount: "+$8.99" },
]

export default function AdminDashboardPage() {
  const enabled = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true' : false
  if (!enabled) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        La sección de administración está desactivada en este entorno.
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Resumen general de la plataforma
          </p>
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
                      stat.changeType === "positive"
                        ? "text-green-500 border-green-500/30"
                        : "text-red-500 border-red-500/30"
                    }
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <FadeIn delay={0.2}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Ingresos mensuales</CardTitle>
              <CardDescription>Evolución de ingresos en 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorIngresos)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Platform Sales Chart */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Ventas por plataforma</CardTitle>
              <CardDescription>Distribución de ventas este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Recent Activity */}
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
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {activity.user}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.action} • {activity.item}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-500">
                      {activity.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
