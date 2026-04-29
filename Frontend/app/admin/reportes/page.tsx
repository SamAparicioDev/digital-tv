"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Monitor,
  Download,
  Calendar,
} from "lucide-react";

const monthlyRevenue = [
  { month: "Ene", ingresos: 4500000, gastos: 1200000 },
  { month: "Feb", ingresos: 5200000, gastos: 1400000 },
  { month: "Mar", ingresos: 4800000, gastos: 1100000 },
  { month: "Abr", ingresos: 6100000, gastos: 1600000 },
  { month: "May", ingresos: 5800000, gastos: 1300000 },
  { month: "Jun", ingresos: 7200000, gastos: 1800000 },
  { month: "Jul", ingresos: 6500000, gastos: 1500000 },
  { month: "Ago", ingresos: 7800000, gastos: 2000000 },
  { month: "Sep", ingresos: 8200000, gastos: 2100000 },
  { month: "Oct", ingresos: 7500000, gastos: 1900000 },
  { month: "Nov", ingresos: 9100000, gastos: 2300000 },
  { month: "Dic", ingresos: 10500000, gastos: 2600000 },
];

const salesByService = [
  { name: "Netflix", value: 35, color: "#E50914" },
  { name: "Disney+", value: 25, color: "#113CCF" },
  { name: "HBO Max", value: 18, color: "#5822B4" },
  { name: "Prime Video", value: 12, color: "#00A8E1" },
  { name: "Spotify", value: 10, color: "#1DB954" },
];

const dailySales = [
  { day: "Lun", ventas: 45, recargas: 32 },
  { day: "Mar", ventas: 52, recargas: 41 },
  { day: "Mié", ventas: 49, recargas: 38 },
  { day: "Jue", ventas: 63, recargas: 45 },
  { day: "Vie", ventas: 78, recargas: 56 },
  { day: "Sáb", ventas: 85, recargas: 62 },
  { day: "Dom", ventas: 71, recargas: 48 },
];

const userGrowth = [
  { month: "Ene", usuarios: 120, activos: 95 },
  { month: "Feb", usuarios: 180, activos: 145 },
  { month: "Mar", usuarios: 250, activos: 200 },
  { month: "Abr", usuarios: 340, activos: 280 },
  { month: "May", usuarios: 420, activos: 350 },
  { month: "Jun", usuarios: 520, activos: 430 },
  { month: "Jul", usuarios: 650, activos: 540 },
  { month: "Ago", usuarios: 780, activos: 650 },
  { month: "Sep", usuarios: 920, activos: 770 },
  { month: "Oct", usuarios: 1080, activos: 900 },
  { month: "Nov", usuarios: 1250, activos: 1050 },
  { month: "Dic", usuarios: 1456, activos: 1220 },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("month");

  const kpis = [
    {
      title: "Ingresos Totales",
      value: "$83.3M",
      change: "+23.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Usuarios Activos",
      value: "1,220",
      change: "+16.2%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Ventas del Mes",
      value: "443",
      change: "+8.7%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Pantallas Vendidas",
      value: "892",
      change: "-2.3%",
      trend: "down",
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reportes y Análisis
          </h1>
          <p className="text-muted-foreground">
            Métricas detalladas de tu negocio
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <kpi.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      kpi.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Ingresos vs Gastos Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient
                        id="colorIngresos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.85 0.18 85)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.85 0.18 85)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorGastos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0 0)"
                    />
                    <XAxis dataKey="month" stroke="oklch(0.65 0 0)" />
                    <YAxis
                      stroke="oklch(0.65 0 0)"
                      tickFormatter={(value) =>
                        `$${(value / 1000000).toFixed(1)}M`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.17 0 0)",
                        border: "1px solid oklch(0.28 0 0)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [
                        `$${value.toLocaleString("es-CO")}`,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="oklch(0.85 0.18 85)"
                      fillOpacity={1}
                      fill="url(#colorIngresos)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="gastos"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorGastos)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Ventas y Recargas por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySales}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0 0)"
                    />
                    <XAxis dataKey="day" stroke="oklch(0.65 0 0)" />
                    <YAxis stroke="oklch(0.65 0 0)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.17 0 0)",
                        border: "1px solid oklch(0.28 0 0)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="ventas"
                      fill="oklch(0.85 0.18 85)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="recargas"
                      fill="oklch(0.7 0.15 85)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Crecimiento de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0 0)"
                    />
                    <XAxis dataKey="month" stroke="oklch(0.65 0 0)" />
                    <YAxis stroke="oklch(0.65 0 0)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.17 0 0)",
                        border: "1px solid oklch(0.28 0 0)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="usuarios"
                      stroke="oklch(0.85 0.18 85)"
                      strokeWidth={3}
                      dot={{ fill: "oklch(0.85 0.18 85)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activos"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Ventas por Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByService}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesByService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.17 0 0)",
                          border: "1px solid oklch(0.28 0 0)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Distribución de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesByService.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {service.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {service.value}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${service.value}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
