"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, CountUp } from "@/components/animations/motion"
import {
  Wallet, Clock, Check, X, DollarSign, TrendingUp, Plus, Search, Users,
  Loader2, AlertCircle, RefreshCw, History, ShoppingBag, ArrowDownRight,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react"
import { cn, formatCOP } from "@/lib/utils"
import { api, type AdminTransaccion, type WalletWithUser } from "@/lib/api"

const PAGE_SIZE = 15

const ESTADO_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'APROBADO', label: 'Aprobado' },
  { key: 'RECHAZADO', label: 'Rechazado' },
] as const

const TIPO_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'deposit', label: 'Recargas' },
  { key: 'withdraw', label: 'Compras' },
] as const

function estadoBadge(estado: string) {
  if (estado === 'APROBADO') return 'text-green-500 border-green-500/30 bg-green-500/10'
  if (estado === 'RECHAZADO') return 'text-red-500 border-red-500/30 bg-red-500/10'
  return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
}

function estadoLabel(estado: string) {
  if (estado === 'APROBADO') return 'Aprobada'
  if (estado === 'RECHAZADO') return 'Rechazada'
  return 'Pendiente'
}

export default function AdminSaldoPage() {
  const [activeTab, setActiveTab] = useState("solicitudes")

  // ── Solicitudes (PENDIENTE) — solo recargas (las compras se aprueban auto) ──
  const [recargas, setRecargas] = useState<AdminTransaccion[]>([])
  const [isLoadingSolicitudes, setIsLoadingSolicitudes] = useState(true)
  const [solicitudesError, setSolicitudesError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const loadSolicitudes = useCallback(async () => {
    setIsLoadingSolicitudes(true)
    setSolicitudesError(null)
    try {
      const data = await api.getAdminTransacciones('PENDIENTE')
      setRecargas(data.filter((t) => t.tipo === 'deposit'))
    } catch (err) {
      setSolicitudesError(err instanceof Error ? err.message : 'Error cargando solicitudes')
    } finally {
      setIsLoadingSolicitudes(false)
    }
  }, [])

  useEffect(() => { loadSolicitudes() }, [loadSolicitudes])

  const handleApprove = async (t: AdminTransaccion) => {
    setProcessingId(t.id)
    try {
      await api.updateAdminTransaccion(t.id, 'APROBADO')
      setRecargas((prev) => prev.filter((s) => s.id !== t.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (t: AdminTransaccion) => {
    setProcessingId(t.id)
    try {
      await api.updateAdminTransaccion(t.id, 'RECHAZADO')
      setRecargas((prev) => prev.filter((s) => s.id !== t.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setProcessingId(null)
    }
  }

  // ── Historial completo ───────────────────────────────────────────────────────
  const [historial, setHistorial] = useState<AdminTransaccion[]>([])
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false)
  const [historialError, setHistorialError] = useState<string | null>(null)
  const [historialEstado, setHistorialEstado] = useState<'all' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('all')
  const [historialTipo, setHistorialTipo] = useState<'all' | 'deposit' | 'withdraw'>('all')
  const [historialSearch, setHistorialSearch] = useState('')
  const [historialPage, setHistorialPage] = useState(1)

  const loadHistorial = useCallback(async () => {
    setIsLoadingHistorial(true)
    setHistorialError(null)
    try {
      const data = await api.getAdminTransacciones()
      setHistorial(data)
    } catch (err) {
      setHistorialError(err instanceof Error ? err.message : 'Error cargando historial')
    } finally {
      setIsLoadingHistorial(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'historial') loadHistorial()
  }, [activeTab, loadHistorial])

  useEffect(() => { setHistorialPage(1) }, [historialEstado, historialTipo, historialSearch])

  const filteredHistorial = historial.filter((t) => {
    if (historialEstado !== 'all' && t.estado !== historialEstado) return false
    if (historialTipo !== 'all' && t.tipo !== historialTipo) return false
    if (historialSearch) {
      const q = historialSearch.toLowerCase()
      const name = (t.wallet?.user?.name ?? '').toLowerCase()
      const email = (t.wallet?.user?.email ?? '').toLowerCase()
      const desc = (t.descripcion ?? '').toLowerCase()
      if (!name.includes(q) && !email.includes(q) && !desc.includes(q)) return false
    }
    return true
  })

  const histTotalPages = Math.max(1, Math.ceil(filteredHistorial.length / PAGE_SIZE))
  const histPaginated = filteredHistorial.slice((historialPage - 1) * PAGE_SIZE, historialPage * PAGE_SIZE)

  // ── Agregar Saldo ────────────────────────────────────────────────────────────
  const [wallets, setWallets] = useState<WalletWithUser[]>([])
  const [isLoadingWallets, setIsLoadingWallets] = useState(false)
  const [walletsError, setWalletsError] = useState<string | null>(null)
  const [searchUser, setSearchUser] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<WalletWithUser | null>(null)
  const [addBalanceOpen, setAddBalanceOpen] = useState(false)
  const [addAmount, setAddAmount] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [isAddingBalance, setIsAddingBalance] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const loadWallets = useCallback(async () => {
    setIsLoadingWallets(true)
    setWalletsError(null)
    try {
      const data = await api.getWallets()
      setWallets(data)
    } catch (err) {
      setWalletsError(err instanceof Error ? err.message : 'Error cargando wallets')
    } finally {
      setIsLoadingWallets(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'agregar') loadWallets()
  }, [activeTab, loadWallets])

  const filteredWallets = wallets.filter(
    (w) =>
      w.user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      w.user.email.toLowerCase().includes(searchUser.toLowerCase())
  )

  const handleAddBalance = async () => {
    if (!selectedWallet || !addAmount) return
    const monto = parseFloat(addAmount)
    if (isNaN(monto) || monto === 0) return
    setIsAddingBalance(true)
    setAddError(null)
    try {
      const result = await api.adjustWalletBalance(selectedWallet.id, monto, addDescription || `Ajuste manual por administrador`)
      setWallets((prev) => prev.map((w) => (w.id === selectedWallet.id ? { ...w, saldo: result.wallet.saldo } : w)))
      setAddSuccess(true)
      setTimeout(() => {
        setAddSuccess(false)
        setAddBalanceOpen(false)
        setSelectedWallet(null)
        setAddAmount("")
        setAddDescription("")
      }, 2000)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error al ajustar saldo')
    } finally {
      setIsAddingBalance(false)
    }
  }

  const pendingTotal = recargas.reduce((sum, s) => sum + s.monto, 0)
  const totalSolicitudes = recargas.length

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Saldo</h1>
          <p className="text-muted-foreground">Aprueba solicitudes de recarga y compra, consulta historial</p>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FadeIn delay={0.1}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solicitudes pendientes</p>
                  <p className="text-xl font-bold text-foreground">{totalSolicitudes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto recargas pendientes</p>
                  <p className="text-xl font-bold text-foreground">
                    $<CountUp end={pendingTotal} duration={1.5} separator="," />
                  </p>
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
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallets activas</p>
                  <p className="text-xl font-bold text-foreground">{wallets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.25}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger value="solicitudes">
              <Clock className="w-4 h-4 mr-2" />
              Solicitudes ({totalSolicitudes})
            </TabsTrigger>
            <TabsTrigger value="historial">
              <History className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="agregar">
              <Plus className="w-4 h-4 mr-2" />
              Ajustar Saldo
            </TabsTrigger>
          </TabsList>

          {/* ── Solicitudes ─────────────────────────────────────────────────── */}
          <TabsContent value="solicitudes" className="mt-4 space-y-4">

            {/* Recargas pendientes */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-green-500" />
                    Recargas pendientes ({recargas.length})
                  </CardTitle>
                  <CardDescription>Solicitudes de recarga de saldo</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={loadSolicitudes} disabled={isLoadingSolicitudes}>
                  <RefreshCw className={cn("w-4 h-4", isLoadingSolicitudes && "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingSolicitudes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : solicitudesError ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <p>{solicitudesError}</p>
                    <Button variant="outline" size="sm" onClick={loadSolicitudes}>Reintentar</Button>
                  </div>
                ) : recargas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay recargas pendientes.</p>
                ) : (
                  <div className="space-y-4">
                    {recargas.map((s) => (
                      <SolicitudRow key={s.id} t={s} processingId={processingId} onApprove={handleApprove} onReject={handleReject} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* ── Historial ─────────────────────────────────────────────────────── */}
          <TabsContent value="historial" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historial de transacciones</CardTitle>
                  <CardDescription>Todas las transacciones del sistema</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={loadHistorial} disabled={isLoadingHistorial}>
                  <RefreshCw className={cn("w-4 h-4", isLoadingHistorial && "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por usuario, email o descripción..."
                      value={historialSearch}
                      onChange={(e) => setHistorialSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    {TIPO_FILTERS.map((f) => (
                      <Button
                        key={f.key}
                        variant={historialTipo === f.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setHistorialTipo(f.key)}
                        className={cn(historialTipo === f.key ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary')}
                      >
                        {f.label}
                      </Button>
                    ))}
                    <div className="w-px h-5 bg-border mx-1" />
                    {ESTADO_FILTERS.map((f) => (
                      <Button
                        key={f.key}
                        variant={historialEstado === f.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setHistorialEstado(f.key as typeof historialEstado)}
                        className={cn(historialEstado === f.key ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary')}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {isLoadingHistorial ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : historialError ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p>{historialError}</p>
                    <Button variant="outline" size="sm" onClick={loadHistorial}>Reintentar</Button>
                  </div>
                ) : histPaginated.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No hay transacciones que coincidan.</p>
                ) : (
                  <div className="space-y-2">
                    {histPaginated.map((t) => {
                      const isIngreso = t.tipo === 'deposit'
                      return (
                        <div
                          key={t.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg flex-shrink-0", isIngreso ? "bg-green-500/10" : "bg-primary/10")}>
                              {isIngreso
                                ? <ArrowDownRight className="w-4 h-4 text-green-500" />
                                : <ShoppingBag className="w-4 h-4 text-primary" />}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {t.wallet?.user?.name ?? 'Usuario'}
                              </p>
                              <p className="text-xs text-muted-foreground">{t.wallet?.user?.email}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.descripcion}</p>
                              <p className="text-xs text-muted-foreground/60 mt-0.5">
                                {new Date(t.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                            <p className={cn("text-base font-bold", isIngreso ? "text-green-500" : "text-foreground")}>
                              {isIngreso ? '+' : '-'}{formatCOP(t.monto)}
                            </p>
                            <Badge variant="outline" className={cn("text-xs", estadoBadge(t.estado))}>
                              {estadoLabel(t.estado)}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Pagination */}
                {histTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {filteredHistorial.length} transacciones · Página {historialPage} de {histTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historialPage === 1}
                        onClick={() => setHistorialPage(p => p - 1)}
                        className="bg-transparent"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historialPage === histTotalPages}
                        onClick={() => setHistorialPage(p => p + 1)}
                        className="bg-transparent"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Ajustar Saldo ─────────────────────────────────────────────────── */}
          <TabsContent value="agregar" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Ajustar Saldo de Usuario
                </CardTitle>
                <CardDescription>Agrega o descuenta saldo manualmente de la wallet de un usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario por nombre o email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isLoadingWallets ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : walletsError ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p>{walletsError}</p>
                    <Button variant="outline" size="sm" onClick={loadWallets}>Reintentar</Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredWallets.map((w) => (
                      <div key={w.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-colors gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                            {w.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{w.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{w.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Saldo</p>
                            <p className="font-semibold text-primary text-sm">{formatCOP(w.saldo)}</p>
                          </div>
                          <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => { setSelectedWallet(w); setAddBalanceOpen(true) }}>
                            <Plus className="w-4 h-4 mr-1" />Ajustar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredWallets.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron usuarios</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Add Balance Dialog */}
      <Dialog open={addBalanceOpen} onOpenChange={(open) => {
        if (!open) { setAddBalanceOpen(false); setSelectedWallet(null); setAddAmount(""); setAddDescription(""); setAddSuccess(false); setAddError(null) }
      }}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          {addSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <DialogTitle className="text-green-500 mb-2">Saldo Ajustado</DialogTitle>
              <DialogDescription>
                Se aplicó un ajuste de {formatCOP(parseFloat(addAmount || '0'))} a {selectedWallet?.user?.name}
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Ajustar Saldo</DialogTitle>
                <DialogDescription>Usa un valor positivo para agregar saldo o negativo para descontar</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {selectedWallet?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedWallet?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedWallet?.user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Saldo actual:</span>
                    <span className="font-semibold text-primary">{formatCOP(selectedWallet?.saldo)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monto (positivo = agregar, negativo = descontar)</Label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[10000, 25000, 50000, 100000].map((preset) => (
                      <Button key={preset} variant={addAmount === String(preset) ? 'default' : 'outline'} size="sm"
                        onClick={() => setAddAmount(String(preset))}
                        className={cn('text-xs', addAmount === String(preset) && 'bg-primary text-primary-foreground')}>
                        ${preset / 1000}k
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input type="number" placeholder="Otro monto" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="pl-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Motivo (requerido)</Label>
                  <Textarea placeholder="Ej: Bonificación por referido, corrección de saldo, etc." value={addDescription} onChange={(e) => setAddDescription(e.target.value)} rows={2} />
                </div>
                {addAmount && !isNaN(parseFloat(addAmount)) && (
                  <div className={cn("p-3 rounded-lg border", parseFloat(addAmount) >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30")}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nuevo saldo:</span>
                      <span className={cn("font-bold", parseFloat(addAmount) >= 0 ? "text-green-500" : "text-red-500")}>
                        {formatCOP((selectedWallet?.saldo ?? 0) + parseFloat(addAmount))}
                      </span>
                    </div>
                  </div>
                )}
                {addError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-500">{addError}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setAddBalanceOpen(false)}>Cancelar</Button>
                <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleAddBalance}
                  disabled={!addAmount || isNaN(parseFloat(addAmount)) || parseFloat(addAmount) === 0 || !addDescription || isAddingBalance}>
                  {isAddingBalance ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Aplicando...</> : <><Plus className="w-4 h-4 mr-2" />Aplicar Ajuste</>}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Fila de solicitud reutilizable ────────────────────────────────────────────

function SolicitudRow({ t, processingId, onApprove, onReject, isCompra = false }: {
  t: AdminTransaccion
  processingId: number | null
  onApprove: (t: AdminTransaccion) => void
  onReject: (t: AdminTransaccion) => void
  isCompra?: boolean
}) {
  return (
    <div className={cn(
      "flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border gap-4",
      isCompra ? "border-primary/30 bg-primary/5" : "border-yellow-500/30 bg-yellow-500/5"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", isCompra ? "bg-primary/10" : "bg-primary/10")}>
          {isCompra
            ? <ShoppingBag className="w-6 h-6 text-primary" />
            : <Wallet className="w-6 h-6 text-primary" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground">{t.wallet?.user?.name ?? 'Usuario'}</p>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 animate-pulse">
              <Clock className="w-3 h-3 mr-1" />pendiente
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t.wallet?.user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
            {!isCompra && t.metodo_pago && (
              <span className="flex items-center gap-1">{t.metodo_pago.emoji} {t.metodo_pago.nombre}</span>
            )}
            {!isCompra && t.referencia_pago && <><span>·</span><span className="font-mono">Ref: {t.referencia_pago}</span></>}
            {isCompra && t.compra && <span>Oferta #{t.compra.oferta_id}</span>}
            <span>·</span>
            <span>{new Date(t.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {!isCompra && t.comprobante_url && (
            <a href={t.comprobante_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.comprobante_url} alt="Comprobante" className="h-16 w-auto rounded border border-border object-cover hover:opacity-80 transition-opacity" />
            </a>
          )}
          {!isCompra && !t.comprobante_url && (
            <span className="text-xs text-muted-foreground/50 mt-1 block">Sin comprobante</span>
          )}
          {isCompra && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Al aprobar se asignan credenciales automáticamente
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-2xl font-bold text-primary">{formatCOP(t.monto)}</p>
        <div className="flex gap-2">
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => onApprove(t)} disabled={processingId === t.id}>
            {processingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />{isCompra ? 'Aprobar' : 'Aprobar'}</>}
          </Button>
          <Button size="sm" variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white bg-transparent" onClick={() => onReject(t)} disabled={processingId === t.id}>
            <X className="w-4 h-4 mr-1" />Rechazar
          </Button>
        </div>
      </div>
    </div>
  )
}
