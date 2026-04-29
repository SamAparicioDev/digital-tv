"use client"

import { useState } from "react"
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
  Download,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSearchParams, Suspense } from "next/navigation"
import Loading from "./loading"

const transactions = [
  {
    id: 1,
    type: "compra",
    title: "Netflix Premium",
    description: "Cuenta completa 4K - 30 días",
    amount: -11.99,
    date: "18 Ene 2024",
    time: "14:32",
    status: "completado",
    orderId: "ORD-2024-001234",
  },
  {
    id: 2,
    type: "recarga",
    title: "Recarga de saldo",
    description: "Tarjeta de crédito ****4532",
    amount: 50.00,
    date: "17 Ene 2024",
    time: "09:15",
    status: "completado",
    orderId: "REC-2024-005678",
  },
  {
    id: 3,
    type: "compra",
    title: "Disney+ Individual",
    description: "Pantalla individual - 30 días",
    amount: -3.99,
    date: "15 Ene 2024",
    time: "18:45",
    status: "completado",
    orderId: "ORD-2024-001233",
  },
  {
    id: 4,
    type: "compra",
    title: "HBO Max Completa",
    description: "Cuenta completa - 30 días",
    amount: -8.99,
    date: "12 Ene 2024",
    time: "11:20",
    status: "completado",
    orderId: "ORD-2024-001232",
  },
  {
    id: 5,
    type: "recarga",
    title: "Recarga de saldo",
    description: "Transferencia bancaria",
    amount: 100.00,
    date: "10 Ene 2024",
    time: "16:08",
    status: "completado",
    orderId: "REC-2024-005677",
  },
  {
    id: 6,
    type: "compra",
    title: "Spotify Premium",
    description: "Cuenta individual - 30 días",
    amount: -6.49,
    date: "08 Ene 2024",
    time: "20:33",
    status: "completado",
    orderId: "ORD-2024-001231",
  },
  {
    id: 7,
    type: "compra",
    title: "Amazon Prime Video",
    description: "Cuenta completa - 30 días",
    amount: -10.39,
    date: "05 Ene 2024",
    time: "13:45",
    status: "reembolsado",
    orderId: "ORD-2024-001230",
  },
]

export default function HistorialPage() {
  const [filter, setFilter] = useState<"all" | "compra" | "recarga">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalCompras = transactions
    .filter((t) => t.type === "compra" && t.status === "completado")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalRecargas = transactions
    .filter((t) => t.type === "recarga")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Historial de transacciones
              </h1>
              <p className="text-muted-foreground">
                Revisa todas tus compras y recargas
              </p>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Exportar
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
                    <p className="text-xl font-bold text-foreground">{transactions.length}</p>
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
                    <p className="text-sm text-muted-foreground">Total compras</p>
                    <p className="text-xl font-bold text-foreground">${totalCompras.toFixed(2)}</p>
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
                    <p className="text-sm text-muted-foreground">Total recargas</p>
                    <p className="text-xl font-bold text-foreground">${totalRecargas.toFixed(2)}</p>
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
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transacción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  {[
                    { key: "all", label: "Todas" },
                    { key: "compra", label: "Compras" },
                    { key: "recarga", label: "Recargas" },
                  ].map((f) => (
                    <Button
                      key={f.key}
                      variant={filter === f.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f.key as typeof filter)}
                      className={cn(
                        "transition-all duration-200",
                        filter === f.key
                          ? "bg-primary text-primary-foreground"
                          : "hover:border-primary hover:text-primary"
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
                Mostrando {filteredTransactions.length} de {transactions.length} transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all duration-200 gap-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          transaction.type === "recarga"
                            ? "bg-green-500/10"
                            : "bg-primary/10"
                        )}
                      >
                        {transaction.type === "recarga" ? (
                          <ArrowDownRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.title}</p>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{transaction.date} • {transaction.time}</span>
                          <span className="text-primary">#{transaction.orderId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <p
                        className={cn(
                          "text-lg font-bold",
                          transaction.amount > 0
                            ? "text-green-500"
                            : transaction.status === "reembolsado"
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          transaction.status === "completado"
                            ? "text-green-500 border-green-500/30"
                            : "text-yellow-500 border-yellow-500/30"
                        )}
                      >
                        {transaction.status === "completado" ? "Completado" : "Reembolsado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </Suspense>
  )
}
