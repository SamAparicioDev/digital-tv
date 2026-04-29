"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, type Transaction, type Screen } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  X,
  User,
  History,
  CreditCard,
  Tv,
  Settings,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  Calendar,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeIn, AnimatedCounter } from "@/components/animations/motion"

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, logout, updateBalance } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("resumen")

  useEffect(() => {
    if (isOpen && user) {
      loadData()
    }
  }, [isOpen, user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [transData, screenData] = await Promise.all([
        api.getTransactions(),
        api.getMyScreens(),
      ])
      setTransactions(transData)
      setScreens(screenData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  if (!user) return null

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background border-border">
          <SheetHeader className="pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <SheetTitle className="text-xl text-foreground">{user.name}</SheetTitle>
                <SheetDescription className="text-muted-foreground">{user.email}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Balance Card */}
          <FadeIn delay={0.1}>
            <Card className="mt-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Saldo disponible</p>
                    <div className="text-3xl font-bold text-foreground">
                      $<AnimatedCounter value={user.balance} duration={1000} decimals={2} />
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsRechargeOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Recargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4 bg-secondary">
              <TabsTrigger value="resumen" className="text-xs">
                <User className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="historial" className="text-xs">
                <History className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Historial</span>
              </TabsTrigger>
              <TabsTrigger value="pantallas" className="text-xs">
                <Tv className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Pantallas</span>
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs">
                <Settings className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Config</span>
              </TabsTrigger>
            </TabsList>

            {/* Resumen Tab */}
            <TabsContent value="resumen" className="mt-4 space-y-4">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Tv className="w-4 h-4" />
                          <span className="text-xs">Pantallas Activas</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {screens.filter(s => s.status === "activo").length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs">Compras del Mes</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {transactions.filter(t => t.type === "compra").length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transactions.slice(0, 3).map((tx) => (
                        <TransactionItem key={tx.id} transaction={tx} />
                      ))}
                      {transactions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay actividad reciente
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Historial Tab */}
            <TabsContent value="historial" className="mt-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historial de Transacciones</CardTitle>
                  <CardDescription>Todas tus compras y recargas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TransactionItem key={tx.id} transaction={tx} showDate />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay transacciones
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pantallas Tab */}
            <TabsContent value="pantallas" className="mt-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : screens.length > 0 ? (
                  screens.map((screen) => (
                    <ScreenCard key={screen.id} screen={screen} />
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-8 text-center">
                      <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No tienes pantallas activas</p>
                      <Button className="mt-4 bg-primary text-primary-foreground">
                        Comprar Pantalla
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config" className="mt-4 space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Nombre</Label>
                    <p className="text-foreground">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Miembro desde</Label>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Recharge Dialog */}
      <RechargeDialog
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        currentBalance={user.balance}
        onSuccess={(newBalance) => {
          updateBalance(newBalance)
          setIsRechargeOpen(false)
        }}
      />
    </>
  )
}

// Transaction Item Component
function TransactionItem({ transaction, showDate = false }: { transaction: Transaction; showDate?: boolean }) {
  const isPositive = transaction.amount > 0

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isPositive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
        )}>
          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{transaction.description}</p>
          {showDate && (
            <p className="text-xs text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString("es-ES")}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-semibold", isPositive ? "text-green-500" : "text-red-500")}>
          {isPositive ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
        </p>
        <Badge variant={transaction.status === "completado" ? "default" : "secondary"} className="text-xs">
          {transaction.status}
        </Badge>
      </div>
    </div>
  )
}

// Screen Card Component
function ScreenCard({ screen }: { screen: Screen }) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const platformColors: Record<string, string> = {
    Netflix: "bg-red-500",
    "Disney+": "bg-blue-500",
    "HBO Max": "bg-purple-500",
    "Amazon Prime": "bg-cyan-500",
    Spotify: "bg-green-500",
  }

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden",
      screen.status === "expirado" && "opacity-60"
    )}>
      <div className={cn("h-1", platformColors[screen.platform] || "bg-primary")} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{screen.platform}</span>
            <Badge variant={screen.status === "activo" ? "default" : "destructive"}>
              {screen.status}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            Expira: {new Date(screen.expiry).toLocaleDateString("es-ES")}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {/* Email */}
          <div className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
            <div>
              <span className="text-xs text-muted-foreground">Email</span>
              <p className="text-foreground">{screen.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(screen.email, `email-${screen.id}`)}
            >
              {copied === `email-${screen.id}` ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
            <div>
              <span className="text-xs text-muted-foreground">Contraseña</span>
              <p className="text-foreground font-mono">
                {showPassword ? screen.password : "••••••••"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(screen.password, `pass-${screen.id}`)}
              >
                {copied === `pass-${screen.id}` ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Profile & PIN */}
          <div className="flex gap-2">
            <div className="flex-1 bg-secondary/30 rounded px-3 py-2">
              <span className="text-xs text-muted-foreground">Perfil</span>
              <p className="text-foreground">{screen.profile}</p>
            </div>
            {screen.pin && (
              <div className="bg-secondary/30 rounded px-3 py-2">
                <span className="text-xs text-muted-foreground">PIN</span>
                <p className="text-foreground font-mono">{screen.pin}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recharge Dialog
function RechargeDialog({
  isOpen,
  onClose,
  currentBalance,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
  onSuccess: (newBalance: number) => void
}) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const presetAmounts = [10, 25, 50, 100]
  const paymentMethods = [
    { id: "nequi", name: "Nequi", icon: "💜" },
    { id: "daviplata", name: "Daviplata", icon: "🔴" },
    { id: "bancolombia", name: "Bancolombia", icon: "💛" },
    { id: "paypal", name: "PayPal", icon: "💙" },
  ]

  const handleRecharge = async () => {
    if (!amount || !method) return

    setIsLoading(true)
    try {
      const result = await api.rechargeBalance(parseFloat(amount), method)
      onSuccess(result.newBalance)
    } catch (error) {
      console.error("Error recargando:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Recargar Saldo</DialogTitle>
          <DialogDescription>
            Saldo actual: <span className="text-primary font-semibold">${currentBalance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Selection */}
          <div className="space-y-3">
            <Label className="text-foreground">Monto a recargar</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === String(preset) ? "default" : "outline"}
                  onClick={() => setAmount(String(preset))}
                  className={cn(
                    amount === String(preset) && "bg-primary text-primary-foreground"
                  )}
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="Otro monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-foreground">Método de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => (
                <Button
                  key={pm.id}
                  variant={method === pm.id ? "default" : "outline"}
                  onClick={() => setMethod(pm.id)}
                  className={cn(
                    "justify-start gap-2",
                    method === pm.id && "bg-primary text-primary-foreground"
                  )}
                >
                  <span>{pm.icon}</span>
                  {pm.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {amount && method && (
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="text-foreground">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground">Nuevo saldo</span>
                  <span className="text-primary font-bold">
                    ${(currentBalance + parseFloat(amount)).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full bg-primary text-primary-foreground"
            disabled={!amount || !method || isLoading}
            onClick={handleRecharge}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Recargar ${amount || "0"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-secondary/50 rounded-lg" />
      ))}
    </div>
  )
}
