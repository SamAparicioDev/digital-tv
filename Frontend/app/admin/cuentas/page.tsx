"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { FadeIn } from "@/components/animations/motion"
import {
  KeyRound, Plus, Trash2, RefreshCw, Loader2, AlertCircle, ChevronDown, ChevronRight,
  Eye, EyeOff, Check, X, Monitor, Calendar, User2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type CuentaAdmin, type PerfilAdmin, type StreamingService } from "@/lib/api"

// ─── Form types ──────────────────────────────────────────────────────────────

interface PerfilForm { nombre: string; pin: string }

interface CuentaForm {
  streaming_service_id: string
  email: string
  password: string
  descripcion: string
  vigencia_hasta: string
  is_active: boolean
  modo: 'cuenta_completa' | 'perfiles'
  perfiles: PerfilForm[]
}

const emptyCuentaForm: CuentaForm = {
  streaming_service_id: '',
  email: '',
  password: '',
  descripcion: '',
  vigencia_hasta: '',
  is_active: true,
  modo: 'cuenta_completa',
  perfiles: [],
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminCuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaAdmin[]>([])
  const [servicios, setServicios] = useState<StreamingService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [showPass, setShowPass] = useState<Set<number>>(new Set())

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCuenta, setEditingCuenta] = useState<CuentaAdmin | null>(null)
  const [form, setForm] = useState<CuentaForm>(emptyCuentaForm)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Add profile dialog
  const [perfilDialog, setPerfilDialog] = useState<{ cuentaId: number } | null>(null)
  const [perfilNombre, setPerfilNombre] = useState('')
  const [perfilPin, setPerfilPin] = useState('')
  const [isSavingPerfil, setIsSavingPerfil] = useState(false)
  const [deletingPerfilId, setDeletingPerfilId] = useState<number | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [c, s] = await Promise.all([api.getAdminCuentas(), api.getStreamingServices()])
      setCuentas(c)
      setServicios(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando cuentas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleExpand = (id: number) =>
    setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const togglePass = (id: number) =>
    setShowPass(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  // ── Cuenta CRUD ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingCuenta(null)
    setForm(emptyCuentaForm)
    setSaveError(null)
    setDialogOpen(true)
  }

  const addPerfilForm = () => setForm(f => ({ ...f, perfiles: [...f.perfiles, { nombre: `Perfil ${f.perfiles.length + 1}`, pin: '' }] }))
  const removePerfilForm = (i: number) => setForm(f => ({ ...f, perfiles: f.perfiles.filter((_, idx) => idx !== i) }))
  const updatePerfilForm = (i: number, key: keyof PerfilForm, val: string) =>
    setForm(f => ({ ...f, perfiles: f.perfiles.map((p, idx) => idx === i ? { ...p, [key]: val } : p) }))

  const openEdit = (c: CuentaAdmin) => {
    setEditingCuenta(c)
    setForm({
      streaming_service_id: String(c.streaming_service_id),
      email: c.email,
      password: c.password,
      descripcion: c.descripcion ?? '',
      vigencia_hasta: c.vigencia_hasta ?? '',
      is_active: c.is_active,
      modo: c.perfiles_total > 0 ? 'perfiles' : 'cuenta_completa',
      perfiles: [],
    })
    setSaveError(null)
    setDialogOpen(true)
  }

  const handleSaveCuenta = async () => {
    if (!form.streaming_service_id || !form.email || !form.password) {
      setSaveError('Servicio, email y contraseña son requeridos')
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      const payload: any = {
        streaming_service_id: parseInt(form.streaming_service_id),
        email: form.email,
        password: form.password,
        descripcion: form.descripcion || undefined,
        vigencia_hasta: form.vigencia_hasta || undefined,
        is_active: form.is_active,
      }
      // Solo en creación: enviar perfiles si modo es "perfiles"
      if (!editingCuenta && form.modo === 'perfiles' && form.perfiles.length > 0) {
        payload.perfiles = form.perfiles.filter(p => p.nombre.trim()).map(p => ({ nombre: p.nombre.trim(), pin: p.pin.trim() || undefined }))
      }
      if (editingCuenta) {
        const updated = await api.updateAdminCuenta(editingCuenta.id, payload)
        setCuentas(prev => prev.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await api.createAdminCuenta(payload)
        setCuentas(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCuenta = async (id: number) => {
    setDeletingId(id)
    try {
      await api.deleteAdminCuenta(id)
      setCuentas(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando cuenta')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Perfil CRUD ───────────────────────────────────────────────────────────

  const openAddPerfil = (cuentaId: number) => {
    setPerfilDialog({ cuentaId })
    setPerfilNombre('')
    setPerfilPin('')
  }

  const handleSavePerfil = async () => {
    if (!perfilDialog || !perfilNombre.trim()) return
    setIsSavingPerfil(true)
    try {
      const perfil = await api.createAdminPerfil(perfilDialog.cuentaId, {
        nombre: perfilNombre.trim(),
        pin: perfilPin.trim() || undefined,
      })
      setCuentas(prev => prev.map(c =>
        c.id === perfilDialog.cuentaId
          ? { ...c, perfiles: [...c.perfiles, perfil], perfiles_total: c.perfiles_total + 1, perfiles_disponibles: c.perfiles_disponibles + 1 }
          : c
      ))
      setPerfilDialog(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar perfil')
    } finally {
      setIsSavingPerfil(false)
    }
  }

  const handleDeletePerfil = async (cuentaId: number, perfilId: number) => {
    setDeletingPerfilId(perfilId)
    try {
      await api.deleteAdminPerfil(perfilId)
      setCuentas(prev => prev.map(c => {
        if (c.id !== cuentaId) return c
        const perfiles = c.perfiles.filter(p => p.id !== perfilId)
        const wasDisponible = c.perfiles.find(p => p.id === perfilId)?.disponible ?? false
        return {
          ...c,
          perfiles,
          perfiles_total: c.perfiles_total - 1,
          perfiles_disponibles: wasDisponible ? c.perfiles_disponibles - 1 : c.perfiles_disponibles,
        }
      }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando perfil')
    } finally {
      setDeletingPerfilId(null)
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalCuentas = cuentas.length
  const totalPerfiles = cuentas.reduce((s, c) => s + c.perfiles_total, 0)
  const perfilesDisponibles = cuentas.reduce((s, c) => s + c.perfiles_disponibles, 0)
  const perfilesAsignados = totalPerfiles - perfilesDisponibles

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cuentas de Streaming</h1>
            <p className="text-muted-foreground">Administra las cuentas y perfiles que se entregan a los usuarios</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Nueva cuenta
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total cuentas', value: totalCuentas, icon: KeyRound, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total perfiles', value: totalPerfiles, icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Disponibles', value: perfilesDisponibles, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Asignados', value: perfilesAsignados, icon: User2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.08}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", s.bg)}>
                    <s.icon className={cn("w-5 h-5", s.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Lista de cuentas */}
      <FadeIn delay={0.2}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p>
            <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
          </div>
        ) : cuentas.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <KeyRound className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No hay cuentas registradas. Crea la primera.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {cuentas.map((cuenta) => {
              const expanded = expandedIds.has(cuenta.id)
              const passVisible = showPass.has(cuenta.id)
              const color = cuenta.streaming_service?.primary_color ?? '#6B7280'

              return (
                <Card key={cuenta.id} className="bg-card border-border overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: color }} />
                  <CardContent className="p-4">
                    {/* Header de la cuenta */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: color }}>
                          {cuenta.streaming_service?.name?.charAt(0) ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">
                              {cuenta.streaming_service?.name ?? 'Servicio'}
                            </span>
                            <Badge variant="outline" className={cn("text-xs",
                              cuenta.is_active ? 'text-green-500 border-green-500/30' : 'text-muted-foreground')}>
                              {cuenta.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                            {cuenta.cuenta_asignada && (
                              <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30">
                                Cuenta asignada
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{cuenta.email}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs font-mono text-muted-foreground">
                              {passVisible ? cuenta.password : '••••••••'}
                            </span>
                            <button onClick={() => togglePass(cuenta.id)} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                              {passVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Perfiles badge */}
                        <div className="text-center px-3 py-1 rounded-lg bg-secondary/50 text-xs">
                          <span className="text-green-500 font-bold">{cuenta.perfiles_disponibles}</span>
                          <span className="text-muted-foreground">/{cuenta.perfiles_total} libres</span>
                        </div>
                        {cuenta.vigencia_hasta && (
                          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(cuenta.vigencia_hasta).toLocaleDateString('es-CO')}
                          </div>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(cuenta)}>Editar</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => toggleExpand(cuenta.id)}>
                          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCuenta(cuenta.id)} disabled={deletingId === cuenta.id}>
                          {deletingId === cuenta.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Perfiles (expandible) */}
                    {expanded && (
                      <div className="mt-4 pt-4 border-t border-border space-y-2">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-foreground">Perfiles de esta cuenta</p>
                          <Button size="sm" variant="outline" className="bg-transparent"
                            onClick={() => openAddPerfil(cuenta.id)}>
                            <Plus className="w-4 h-4 mr-1" /> Agregar perfil
                          </Button>
                        </div>

                        {cuenta.perfiles.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Sin perfiles. Esta cuenta se vende completa.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {cuenta.perfiles.map((p) => (
                              <div key={p.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border text-sm",
                                  p.disponible ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5 opacity-70'
                                )}>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-foreground">{p.nombre}</span>
                                    <Badge variant="outline" className={cn("text-xs",
                                      p.disponible ? 'text-green-500 border-green-500/30' : 'text-orange-500 border-orange-500/30')}>
                                      {p.disponible ? 'Libre' : 'Asignado'}
                                    </Badge>
                                  </div>
                                  {p.pin && (
                                    <p className="text-xs text-muted-foreground mt-0.5">PIN: {p.pin}</p>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                  disabled={!p.disponible || deletingPerfilId === p.id}
                                  onClick={() => handleDeletePerfil(cuenta.id, p.id)}>
                                  {deletingPerfilId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </FadeIn>

      {/* Dialog crear/editar cuenta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCuenta ? 'Editar cuenta' : 'Nueva cuenta de streaming'}</DialogTitle>
            <DialogDescription>Completa los datos de acceso de la cuenta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Servicio de streaming *</Label>
              <select
                value={form.streaming_service_id}
                onChange={(e) => setForm({ ...form, streaming_service_id: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Selecciona un servicio</option>
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Email / usuario *</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
            </div>

            <div className="space-y-2">
              <Label>Contraseña *</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña de la cuenta" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vigencia hasta (admin)</Label>
                <Input type="date" value={form.vigencia_hasta} onChange={(e) => setForm({ ...form, vigencia_hasta: e.target.value })} />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Activa</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Notas internas..." />
            </div>

            {/* Modo venta (solo en creación) */}
            {!editingCuenta && (
              <div className="space-y-3 border border-border rounded-lg p-3">
                <Label className="text-sm font-semibold">Tipo de venta</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, modo: 'cuenta_completa', perfiles: [] }))}
                    className={cn("flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all", form.modo === 'cuenta_completa' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}
                  >
                    Cuenta completa
                    <p className="text-xs font-normal text-muted-foreground mt-0.5">Se vende como un todo, sin perfiles</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, modo: 'perfiles', perfiles: [{ nombre: 'Perfil 1', pin: '' }] }))}
                    className={cn("flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all", form.modo === 'perfiles' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}
                  >
                    Por perfiles
                    <p className="text-xs font-normal text-muted-foreground mt-0.5">Cada perfil se vende por separado</p>
                  </button>
                </div>

                {form.modo === 'perfiles' && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground">Perfiles</Label>
                      <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={addPerfilForm}>
                        <Plus className="w-3 h-3 mr-1" />Agregar
                      </Button>
                    </div>
                    {form.perfiles.map((p, i) => (
                      <div key={i} className="grid grid-cols-[1fr_80px_28px] gap-2 items-center">
                        <Input value={p.nombre} onChange={e => updatePerfilForm(i, 'nombre', e.target.value)} placeholder="Perfil 1" className="h-8 text-sm" />
                        <Input value={p.pin} onChange={e => updatePerfilForm(i, 'pin', e.target.value)} placeholder="PIN" maxLength={10} className="h-8 text-sm" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-7 text-destructive" onClick={() => removePerfilForm(i)}><X className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSaveCuenta} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : editingCuenta ? 'Guardar cambios' : 'Crear cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog agregar perfil */}
      <Dialog open={!!perfilDialog} onOpenChange={() => setPerfilDialog(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar perfil</DialogTitle>
            <DialogDescription>Define el nombre y PIN del perfil en la cuenta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre del perfil *</Label>
              <Input value={perfilNombre} onChange={(e) => setPerfilNombre(e.target.value)} placeholder="Ej: Perfil 1, Kids, Principal..." />
            </div>
            <div className="space-y-2">
              <Label>PIN (opcional)</Label>
              <Input value={perfilPin} onChange={(e) => setPerfilPin(e.target.value)} placeholder="1234" maxLength={10} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setPerfilDialog(null)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSavePerfil} disabled={isSavingPerfil || !perfilNombre.trim()}>
              {isSavingPerfil ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Agregar perfil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
