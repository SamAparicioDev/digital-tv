"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { FadeIn } from "@/components/animations/motion"
import {
  Users, Search, Wallet, Loader2, RefreshCw, AlertCircle, UserCheck, UserX, KeyRound, Monitor, Check,
} from "lucide-react"
import { api, type WalletWithUser, type CuentaAdmin, type PerfilAdmin } from "@/lib/api"
import { formatCOP, cn } from "@/lib/utils"

export default function AdminUsuariosPage() {
  const [wallets, setWallets] = useState<WalletWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Asignación de credencial
  const [assignDialog, setAssignDialog] = useState<{ userId: number; userName: string } | null>(null)
  const [cuentas, setCuentas] = useState<CuentaAdmin[]>([])
  const [isLoadingCuentas, setIsLoadingCuentas] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaAdmin | null>(null)
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilAdmin | null>(null)
  const [vigDesde, setVigDesde] = useState(new Date().toISOString().split('T')[0])
  const [vigHasta, setVigHasta] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignOk, setAssignOk] = useState(false)

  const load = async () => {
    setIsLoading(true); setError(null)
    try { setWallets(await api.getWallets()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Error cargando usuarios') }
    finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleToggle = async (userId: number) => {
    setTogglingId(userId)
    try {
      const result = await api.toggleUserStatus(userId)
      setWallets(prev => prev.map(w => w.user.id === userId ? { ...w, user: { ...w.user, is_active: result.is_active } } : w))
    } catch (err) { alert(err instanceof Error ? err.message : 'Error al cambiar estado') }
    finally { setTogglingId(null) }
  }

  const openAssignDialog = async (userId: number, userName: string) => {
    setAssignDialog({ userId, userName })
    setSelectedCuenta(null); setSelectedPerfil(null)
    setVigHasta(''); setAssignError(null); setAssignOk(false)
    if (cuentas.length === 0) {
      setIsLoadingCuentas(true)
      try { setCuentas(await api.getAdminCuentas()) }
      catch { }
      finally { setIsLoadingCuentas(false) }
    }
  }

  const handleAssign = async () => {
    if (!assignDialog) return
    if (!selectedCuenta) { setAssignError('Selecciona una cuenta'); return }
    if (!vigHasta) { setAssignError('Ingresa la fecha de vigencia'); return }

    setIsAssigning(true); setAssignError(null)
    try {
      await api.asignarCredencial({
        user_id: assignDialog.userId,
        cuenta_id: selectedPerfil ? null : selectedCuenta.id,
        perfil_id: selectedPerfil?.id ?? null,
        vigencia_desde: vigDesde,
        vigencia_hasta: vigHasta,
      })
      setAssignOk(true)
    } catch (err) { setAssignError(err instanceof Error ? err.message : 'Error al asignar') }
    finally { setIsAssigning(false) }
  }

  const filtered = wallets.filter(w =>
    w.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalSaldo = wallets.reduce((s, w) => s + Number(w.saldo), 0)
  const activos = wallets.filter(w => (w.user as any).is_active !== false).length

  return (
    <Suspense>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de usuarios</h1>
              <p className="text-muted-foreground">Usuarios registrados en la plataforma</p>
            </div>
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Actualizar
            </Button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total usuarios', icon: Users, color: 'text-primary', bg: 'bg-primary/10', text: String(wallets.length) },
            { label: 'Activos', icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10', text: String(activos) },
            { label: 'Con saldo', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10', text: String(wallets.filter(w => Number(w.saldo) > 0).length) },
            { label: 'Saldo circulante', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10', text: formatCOP(totalSaldo) },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                    <div className="min-w-0"><p className="text-xs text-muted-foreground truncate">{s.label}</p><p className="text-xl font-bold text-foreground truncate">{s.text}</p></div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Search */}
        <FadeIn delay={0.25}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Lista de usuarios</CardTitle>
              <CardDescription>Mostrando {filtered.length} de {wallets.length} usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              : error ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p><Button variant="outline" size="sm" onClick={load}>Reintentar</Button></div>
              : (
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Miembro desde</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(w => {
                        const isActive = (w.user as any).is_active !== false
                        return (
                          <TableRow key={w.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                                  <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{w.user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <p className="font-medium text-foreground">{w.user.name}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{w.user.email}</TableCell>
                            <TableCell>
                              <span className={`font-semibold ${Number(w.saldo) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>{formatCOP(w.saldo)}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(w.user.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={isActive ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}>
                                {isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                                  onClick={() => openAssignDialog(w.user.id, w.user.name)}>
                                  <KeyRound className="w-3 h-3 mr-1" />Asignar
                                </Button>
                                <Button variant="ghost" size="sm"
                                  className={isActive ? 'text-red-500 hover:text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:text-green-500 hover:bg-green-500/10'}
                                  onClick={() => handleToggle(w.user.id)} disabled={togglingId === w.user.id}>
                                  {togglingId === w.user.id ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : isActive ? <><UserX className="w-4 h-4 mr-1" />Desactivar</>
                                    : <><UserCheck className="w-4 h-4 mr-1" />Activar</>}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {filtered.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No se encontraron usuarios</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Dialog: Asignar credencial */}
      <Dialog open={!!assignDialog} onOpenChange={open => { if (!open) setAssignDialog(null) }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asignar credencial</DialogTitle>
            <DialogDescription>Entrega acceso directo a {assignDialog?.userName} sin pasar por el flujo de compra</DialogDescription>
          </DialogHeader>

          {assignOk ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-green-500" />
              </div>
              <p className="font-semibold text-foreground">¡Credencial asignada!</p>
              <p className="text-sm text-muted-foreground">El usuario ya puede ver sus credenciales en "Mis Cuentas".</p>
              <Button variant="ghost" onClick={() => setAssignDialog(null)}>Cerrar</Button>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {/* Seleccionar cuenta */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">1. Selecciona la cuenta</Label>
                {isLoadingCuentas ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cuentas.filter(c => !c.cuenta_asignada || c.perfiles_disponibles > 0).map(c => {
                      const color = c.streaming_service?.primary_color ?? '#6B7280'
                      const isSel = selectedCuenta?.id === c.id
                      return (
                        <button key={c.id} onClick={() => { setSelectedCuenta(c); setSelectedPerfil(null) }}
                          className={cn("w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all", isSel ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                          <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                            {c.streaming_service?.name?.charAt(0) ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{c.streaming_service?.name} — {c.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.perfiles_total === 0 ? 'Cuenta completa' : `${c.perfiles_disponibles}/${c.perfiles_total} perfiles libres`}
                            </p>
                          </div>
                          {isSel && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      )
                    })}
                    {cuentas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay cuentas disponibles</p>}
                  </div>
                )}
              </div>

              {/* Seleccionar perfil (si la cuenta tiene perfiles) */}
              {selectedCuenta && selectedCuenta.perfiles_total > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">2. Selecciona el perfil</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCuenta.perfiles.filter(p => p.disponible).map(p => {
                      const isSel = selectedPerfil?.id === p.id
                      return (
                        <button key={p.id} onClick={() => setSelectedPerfil(p)}
                          className={cn("flex items-center gap-2 p-2.5 rounded-lg border-2 text-sm transition-all", isSel ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                          <Monitor className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-medium text-foreground">{p.nombre}</p>
                            {p.pin && <p className="text-xs text-muted-foreground">PIN: {p.pin}</p>}
                          </div>
                          {isSel && <Check className="w-3 h-3 text-primary ml-auto" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Vigencia */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{selectedCuenta?.perfiles_total ? '3.' : '2.'} Período de vigencia</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Desde</Label>
                    <Input type="date" value={vigDesde} onChange={e => setVigDesde(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Hasta *</Label>
                    <Input type="date" value={vigHasta} onChange={e => setVigHasta(e.target.value)} min={vigDesde} />
                  </div>
                </div>
              </div>

              {assignError && <p className="text-sm text-destructive">{assignError}</p>}
            </div>
          )}

          {!assignOk && (
            <DialogFooter>
              <Button variant="outline" className="bg-transparent" onClick={() => setAssignDialog(null)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleAssign} disabled={isAssigning || !selectedCuenta || !vigHasta}>
                {isAssigning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Asignando...</> : <><KeyRound className="w-4 h-4 mr-2" />Asignar credencial</>}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Suspense>
  )
}
