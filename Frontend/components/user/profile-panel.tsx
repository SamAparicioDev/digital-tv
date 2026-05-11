"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, type Transaccion, type Compra } from "@/lib/api"
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
  User,
  History,
  CreditCard,
  Tv,
  Settings,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Loader2,
  TrendingUp,
  Calendar,
  LogOut,
  PackageCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeIn, AnimatedCounter } from "@/components/animations/motion"

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, logout, refreshUser } = useAuth()
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [compras, setCompras] = useState<Compra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("resumen")

  useEffect(() => {
    if (isOpen && user) loadData()
  }, [isOpen, user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [recargasData, comprasData] = await Promise.all([
        api.getRecargas().then((d) => d.transacciones).catch(() => [] as Transaccion[]),
        api.getCompras().catch(() => [] as Compra[]),
      ])
      setTransacciones(recargasData)
      setCompras(comprasData)
    } catch (error) {
      console.error("Error loading profile data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  if (!user) return null

  const comprasAprobadas = compras.filter((c) => c.estado === 'aprobada')
  const comprasMes = compras.filter((c) => {
    const d = new Date(c.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

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
                      $<AnimatedCounter value={user.balance} duration={1000} decimals={0} />
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
              <TabsTrigger value="compras" className="text-xs">
                <Tv className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Compras</span>
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
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Tv className="w-4 h-4" />
                          <span className="text-xs">Compras Aprobadas</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{comprasAprobadas.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs">Compras del Mes</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{comprasMes}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transacciones.slice(0, 3).map((tx) => (
                        <TransactionItem key={tx.id} transaccion={tx} />
                      ))}
                      {transacciones.length === 0 && (
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
                  <CardDescription>Todas tus recargas y compras</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : transacciones.length > 0 ? (
                    transacciones.map((tx) => (
                      <TransactionItem key={tx.id} transaccion={tx} showDate />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay transacciones
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compras Tab */}
            <TabsContent value="compras" className="mt-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : compras.length > 0 ? (
                  compras.map((c) => <CompraCard key={c.id} compra={c} />)
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-8 text-center">
                      <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No tienes compras registradas</p>
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
                  {user.roles && user.roles.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Roles</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.roles.map((r) => (
                          <Badge key={r.id} variant="outline" className="text-primary border-primary/30">
                            {r.nombre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button variant="destructive" className="w-full" onClick={handleLogout}>
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
        onSuccess={async () => {
          setIsRechargeOpen(false)
          await refreshUser()
          await loadData()
        }}
      />
    </>
  )
}

// ─── TransactionItem ──────────────────────────────────────────────────────────

function TransactionItem({ transaccion: tx, showDate = false }: { transaccion: Transaccion; showDate?: boolean }) {
  const isIngreso = tx.tipo === 'deposit'
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isIngreso ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
        )}>
          {isIngreso ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground line-clamp-1">{tx.descripcion}</p>
          {showDate && (
            <p className="text-xs text-muted-foreground">
              {new Date(tx.created_at).toLocaleDateString("es-ES")}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-semibold", isIngreso ? "text-green-500" : "text-red-500")}>
          {isIngreso ? '+' : '-'}${tx.monto.toLocaleString('es-CO')}
        </p>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            tx.estado === 'APROBADO' ? "text-green-500 border-green-500/30" :
            tx.estado === 'RECHAZADO' ? "text-red-500 border-red-500/30" :
            "text-yellow-500 border-yellow-500/30"
          )}
        >
          {tx.estado}
        </Badge>
      </div>
    </div>
  )
}

// ─── CompraCard ───────────────────────────────────────────────────────────────

function CompraCard({ compra }: { compra: Compra }) {
  const serviceName = compra.oferta?.servicios?.[0]?.name ?? `Oferta #${compra.oferta_id}`
  const color = compra.oferta?.servicios?.[0]?.primary_color ?? '#6B7280'

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4" style={{ color }} />
            <span className="font-semibold text-foreground">{serviceName}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              compra.estado === 'aprobada' ? "text-green-500 border-green-500/30" :
              compra.estado === 'rechazada' ? "text-red-500 border-red-500/30" :
              "text-yellow-500 border-yellow-500/30"
            )}
          >
            {compra.estado}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${compra.precio_compra.toLocaleString('es-CO')}</span>
          <span>{new Date(compra.created_at).toLocaleDateString('es-ES')}</span>
        </div>
        {compra.estado === 'pendiente' && (
          <p className="text-xs text-yellow-500 mt-2">
            Pendiente de aprobación por un administrador
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── RechargeDialog ───────────────────────────────────────────────────────────

function RechargeDialog({
  isOpen,
  onClose,
  currentBalance,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
  onSuccess: () => Promise<void>
}) {
  const [amount, setAmount] = useState("")
  const [referencia, setReferencia] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const presetAmounts = [10000, 25000, 50000, 100000]

  const handleRecharge = async () => {
    if (!amount) return
    const monto = parseFloat(amount)
    if (isNaN(monto) || monto <= 0) return

    setIsLoading(true)
    setError(null)
    try {
      await api.createRecarga(monto, referencia || undefined)
      setSuccess(true)
      setTimeout(async () => {
        setSuccess(false)
        setAmount("")
        setReferencia("")
        await onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Solicitar Recarga</DialogTitle>
          <DialogDescription>
            Saldo actual: <span className="text-primary font-semibold">${currentBalance.toLocaleString('es-CO')}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold text-foreground">¡Solicitud enviada!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tu recarga está pendiente de aprobación por un administrador.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Monto a recargar (COP)</Label>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === String(preset) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(String(preset))}
                    className={cn("text-xs", amount === String(preset) && "bg-primary text-primary-foreground")}
                  >
                    ${preset / 1000}k
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
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referencia de pago (opcional)</Label>
              <Input
                placeholder="Número de transferencia / comprobante"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button
              className="w-full bg-primary text-primary-foreground"
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              onClick={handleRecharge}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" />Solicitar ${amount ? parseFloat(amount).toLocaleString('es-CO') : '0'}</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              La recarga se aprobará manualmente por un administrador
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-secondary/50 rounded-lg" />
      ))}
    </div>
  )
}
