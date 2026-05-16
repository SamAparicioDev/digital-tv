"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FadeIn } from "@/components/animations/motion"
import {
  Users, Search, Wallet, Loader2, RefreshCw, AlertCircle, UserCheck, UserX, ShieldCheck,
} from "lucide-react"
import { api, type WalletWithUser, type Role } from "@/lib/api"
import { formatCOP } from "@/lib/utils"

export default function AdminUsuariosPage() {
  const [wallets, setWallets] = useState<WalletWithUser[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [rolesDialog, setRolesDialog] = useState<{ open: boolean; wallet: WalletWithUser | null }>({ open: false, wallet: null })
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())
  const [savingRoles, setSavingRoles] = useState(false)

  const load = async () => {
    setIsLoading(true); setError(null)
    try {
      const [ws, roles] = await Promise.all([api.getWallets(), api.getRoles()])
      setWallets(ws)
      setAllRoles(roles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando usuarios')
    } finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleToggle = async (userId: number) => {
    setTogglingId(userId)
    try {
      const result = await api.toggleUserStatus(userId)
      setWallets(prev => prev.map(w =>
        w.user.id === userId ? { ...w, user: { ...w.user, is_active: result.is_active } } : w
      ))
    } catch (err) { alert(err instanceof Error ? err.message : 'Error al cambiar estado') }
    finally { setTogglingId(null) }
  }

  const openRolesDialog = (wallet: WalletWithUser) => {
    setRolesDialog({ open: true, wallet })
    setSelectedRoles(new Set((wallet.user.roles ?? []).map(r => String(r.id))))
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      next.has(roleId) ? next.delete(roleId) : next.add(roleId)
      return next
    })
  }

  const saveRoles = async () => {
    if (!rolesDialog.wallet) return
    setSavingRoles(true)
    try {
      const result = await api.syncUserRoles(rolesDialog.wallet.user.id, Array.from(selectedRoles))
      setWallets(prev => prev.map(w =>
        w.user.id === rolesDialog.wallet!.user.id
          ? { ...w, user: { ...w.user, roles: result.roles } }
          : w
      ))
      setRolesDialog({ open: false, wallet: null })
    } catch (err) { alert(err instanceof Error ? err.message : 'Error al guardar roles') }
    finally { setSavingRoles(false) }
  }

  const filtered = wallets.filter(w =>
    w.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalSaldo = wallets.reduce((s, w) => s + Number(w.saldo), 0)
  const activos = wallets.filter(w => w.user.is_active !== false).length

  return (
    <Suspense>
      <div className="space-y-4 sm:space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Gestión de usuarios</h1>
              <p className="text-muted-foreground text-sm">Usuarios registrados en la plataforma</p>
            </div>
            <Button variant="outline" className="bg-transparent self-start sm:self-auto" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Actualizar
            </Button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', icon: Users, color: 'text-primary', bg: 'bg-primary/10', text: String(wallets.length) },
            { label: 'Activos', icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10', text: String(activos) },
            { label: 'Con saldo', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10', text: String(wallets.filter(w => Number(w.saldo) > 0).length) },
            { label: 'Circulante', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10', text: formatCOP(totalSaldo) },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${s.bg} flex-shrink-0`}><s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} /></div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                      <p className="text-base sm:text-xl font-bold text-foreground truncate">{s.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Search */}
        <FadeIn delay={0.25}>
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Lista */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Lista de usuarios</CardTitle>
              <CardDescription>Mostrando {filtered.length} de {wallets.length} usuarios</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {isLoading
                ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                : error
                ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground px-4"><AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p><Button variant="outline" size="sm" onClick={load}>Reintentar</Button></div>
                : filtered.length === 0
                ? <p className="text-center text-muted-foreground py-8 text-sm">No se encontraron usuarios</p>
                : (
                  <>
                    {/* ── Mobile: cards ──────────────────────────────── */}
                    <div className="sm:hidden divide-y divide-border">
                      {filtered.map(w => {
                        const isActive = w.user.is_active !== false
                        const roles = w.user.roles ?? []
                        return (
                          <div key={w.id} className="p-4 space-y-3">
                            {/* Header: avatar + nombre + estado */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                                  <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {w.user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground truncate">{w.user.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{w.user.email}</p>
                                  {w.user.phone && (
                                    <p className="text-xs text-primary truncate">📱 {w.user.phone}</p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className={`flex-shrink-0 text-xs ${isActive ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}`}>
                                {isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>

                            {/* Roles */}
                            <div className="flex flex-wrap gap-1">
                              {roles.length === 0
                                ? <span className="text-xs text-muted-foreground">Sin rol asignado</span>
                                : roles.map(r => <Badge key={r.id} variant="secondary" className="text-xs capitalize">{r.nombre}</Badge>)
                              }
                            </div>

                            {/* Saldo + acciones */}
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <p className="text-xs text-muted-foreground">Saldo</p>
                                <p className={`font-semibold text-sm ${Number(w.saldo) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                                  {formatCOP(w.saldo)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10 h-8 px-3"
                                  onClick={() => openRolesDialog(w)}>
                                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />Roles
                                </Button>
                                <Button variant="outline" size="sm"
                                  className={`h-8 px-3 ${isActive ? 'text-red-500 border-red-500/30 hover:bg-red-500/10' : 'text-green-500 border-green-500/30 hover:bg-green-500/10'}`}
                                  onClick={() => handleToggle(w.user.id)} disabled={togglingId === w.user.id}>
                                  {togglingId === w.user.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : isActive
                                    ? <><UserX className="w-3.5 h-3.5 mr-1" />Desactivar</>
                                    : <><UserCheck className="w-3.5 h-3.5 mr-1" />Activar</>
                                  }
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* ── Desktop: tabla ─────────────────────────────── */}
                    <div className="hidden sm:block rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="hidden lg:table-cell">WhatsApp</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Saldo</TableHead>
                            <TableHead className="hidden lg:table-cell">Miembro desde</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map(w => {
                            const isActive = w.user.is_active !== false
                            const roles = w.user.roles ?? []
                            return (
                              <TableRow key={w.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                                      <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{w.user.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <p className="font-medium text-foreground">{w.user.name}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-[160px] truncate">{w.user.email}</TableCell>
                                <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                                  {w.user.phone || <span className="text-muted-foreground/40">—</span>}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {roles.length === 0
                                      ? <span className="text-xs text-muted-foreground">Sin rol</span>
                                      : roles.map(r => <Badge key={r.id} variant="secondary" className="text-xs capitalize">{r.nombre}</Badge>)
                                    }
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={`font-semibold text-sm ${Number(w.saldo) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>{formatCOP(w.saldo)}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                                  {new Date(w.user.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={isActive ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}>
                                    {isActive ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-500 hover:bg-blue-500/10"
                                      onClick={() => openRolesDialog(w)}>
                                      <ShieldCheck className="w-4 h-4 mr-1" />Roles
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
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )
              }
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Dialog de gestión de roles */}
      <Dialog open={rolesDialog.open} onOpenChange={open => !open && setRolesDialog({ open: false, wallet: null })}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Roles de {rolesDialog.wallet?.user.name}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-2">
            {allRoles.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-4">No hay roles creados</p>
              : allRoles.filter(r => ['admin', 'cliente'].includes(r.nombre.toLowerCase())).map(role => {
                const checked = selectedRoles.has(String(role.id))
                return (
                  <button key={role.id} onClick={() => toggleRole(String(role.id))}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left
                      ${checked ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border/80 hover:bg-secondary/30'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors
                      ${checked ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                      {checked && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>}
                    </div>
                    <span className="font-medium capitalize text-foreground">{role.nombre}</span>
                  </button>
                )
              })
            }
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRolesDialog({ open: false, wallet: null })} disabled={savingRoles}>
              Cancelar
            </Button>
            <Button onClick={saveRoles} disabled={savingRoles}>
              {savingRoles ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Guardar roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Suspense>
  )
}
