"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Percent, RefreshCw, Loader2, AlertCircle, Search, Calendar, Check, X, Trash2, Plus, Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Descuento, type Role, type StreamingService } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface RolRow { role_id: string; valor_descuento: string; tipo_descuento: 'porcentaje' | 'fijo' }

interface DescuentoForm {
  nombre: string
  codigo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  es_recurrente: boolean
  is_active: boolean
  // Valor global (cuando no hay roles específicos)
  valor_global: string
  tipo_global: 'porcentaje' | 'fijo'
  // Por rol (desactiva el valor global si hay entradas)
  roles: RolRow[]
  // Por servicios (múltiples, vacío = todos)
  streaming_service_ids: string[]
}

const emptyForm: DescuentoForm = {
  nombre: '', codigo: '', descripcion: '',
  fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: '',
  es_recurrente: false, is_active: true,
  valor_global: '', tipo_global: 'porcentaje',
  roles: [], streaming_service_ids: [],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPromocionesPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [servicios, setServicios] = useState<StreamingService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDesc, setEditingDesc] = useState<Descuento | null>(null)
  const [form, setForm] = useState<DescuentoForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true); setError(null)
    try {
      const [d, r, s] = await Promise.all([
        api.getDescuentos(),
        api.getRoles().catch(() => [] as Role[]),
        api.getStreamingServices().catch(() => [] as StreamingService[]),
      ])
      setDescuentos(d); setRoles(r); setServicios(s)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error cargando') }
    finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  // ── Form helpers ─────────────────────────────────────────────────────────────

  const openCreate = () => { setEditingDesc(null); setForm(emptyForm); setSaveError(null); setDialogOpen(true) }

  const openEdit = (d: Descuento) => {
    setEditingDesc(d)
    setForm({
      nombre: d.nombre, codigo: d.codigo ?? '', descripcion: d.descripcion ?? '',
      fecha_inicio: d.fecha_inicio.split('T')[0],
      fecha_fin: d.fecha_fin?.split('T')[0] ?? '',
      es_recurrente: d.es_recurrente, is_active: d.is_active,
      valor_global: d.valor_global != null ? String(d.valor_global) : '',
      tipo_global: d.tipo_global ?? 'porcentaje',
      roles: d.roles?.map(r => ({
        role_id: String(r.id),
        valor_descuento: String(r.pivot.valor_descuento),
        tipo_descuento: r.pivot.tipo_descuento,
      })) ?? [],
      streaming_service_ids: d.streaming_services?.map(s => String(s.id)) ?? [],
    })
    setSaveError(null); setDialogOpen(true)
  }

  const addRol = () => setForm(f => ({
    ...f, roles: [...f.roles, { role_id: '', valor_descuento: '', tipo_descuento: 'porcentaje' }]
  }))
  const removeRol = (i: number) => setForm(f => ({ ...f, roles: f.roles.filter((_, idx) => idx !== i) }))
  const updateRol = (i: number, key: keyof RolRow, val: string) =>
    setForm(f => ({ ...f, roles: f.roles.map((r, idx) => idx === i ? { ...r, [key]: val } : r) }))

  const toggleServicio = (id: string) =>
    setForm(f => ({
      ...f,
      streaming_service_ids: f.streaming_service_ids.includes(id)
        ? f.streaming_service_ids.filter(s => s !== id)
        : [...f.streaming_service_ids, id],
    }))

  // Con roles activos el valor global se ignora
  const hasRoles = form.roles.filter(r => r.role_id).length > 0

  const handleSave = async () => {
    if (!form.nombre.trim()) { setSaveError('El nombre es requerido'); return }
    if (!form.fecha_inicio) { setSaveError('La fecha de inicio es requerida'); return }
    if (!hasRoles && !form.valor_global) { setSaveError('Ingresa un valor de descuento global o agrega descuentos por rol'); return }

    setIsSaving(true); setSaveError(null)
    try {
      const payload: any = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || undefined,
        es_recurrente: form.es_recurrente,
        is_active: form.is_active,
        streaming_service_ids: form.streaming_service_ids.map(id => parseInt(id)),
      }
      if (form.codigo) payload.codigo = form.codigo

      if (!hasRoles) {
        // Descuento global
        payload.valor_global = parseFloat(form.valor_global)
        payload.tipo_global = form.tipo_global
        payload.roles_asignar = []
      } else {
        // Por rol — role_id es UUID (string), NO parseInt
        payload.valor_global = null
        payload.tipo_global = null
        payload.roles_asignar = form.roles
          .filter(r => r.role_id && r.valor_descuento)
          .map(r => ({
            role_id: r.role_id,
            valor_descuento: parseFloat(r.valor_descuento),
            tipo_descuento: r.tipo_descuento,
          }))
      }

      if (editingDesc) {
        const updated = await api.updateDescuento(editingDesc.id, payload)
        setDescuentos(prev => prev.map(d => d.id === updated.id ? updated : d))
      } else {
        const created = await api.createDescuento(payload)
        setDescuentos(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) { setSaveError(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setIsSaving(false) }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await api.deleteDescuento(id); setDescuentos(prev => prev.filter(d => d.id !== id)) }
    catch (err) { alert(err instanceof Error ? err.message : 'Error eliminando') }
    finally { setDeletingId(null) }
  }

  const isVigente = (d: Descuento) => {
    const now = new Date(); const inicio = new Date(d.fecha_inicio)
    const fin = d.fecha_fin ? new Date(d.fecha_fin) : null
    return inicio <= now && (!fin || fin >= now)
  }

  const filtered = descuentos.filter(d =>
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.codigo ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activos = descuentos.filter(d => d.is_active).length

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Descuentos</h1>
            <p className="text-muted-foreground">Descuentos y promociones de la plataforma</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />Actualizar
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />Nuevo descuento
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: descuentos.length, icon: Percent, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Activos', value: activos, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Inactivos', value: descuentos.length - activos, icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.1}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", s.bg)}><s.icon className={cn("w-5 h-5", s.color)} /></div>
                  <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Search */}
      <FadeIn delay={0.2}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o código..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* List */}
      <FadeIn delay={0.3}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Descuentos</CardTitle>
            <CardDescription>{filtered.length} encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            : error ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p><Button variant="outline" size="sm" onClick={load}>Reintentar</Button></div>
            : filtered.length === 0 ? <p className="text-center text-muted-foreground py-12">No hay descuentos registrados.</p>
            : (
              <div className="space-y-3">
                {filtered.map((d) => {
                  const vigente = isVigente(d)
                  const services = d.streaming_services ?? []
                  return (
                    <div key={d.id} className={cn("flex flex-col lg:flex-row lg:items-start justify-between p-4 rounded-lg border gap-4", d.is_active && vigente ? "border-border" : "border-border/50 opacity-60")}>
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0"><Percent className="w-5 h-5 text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{d.nombre}</h3>
                            {d.codigo && <Badge variant="outline" className="text-xs font-mono">{d.codigo}</Badge>}
                            <Badge variant="outline" className={cn("text-xs", d.is_active && vigente ? "text-green-500 border-green-500/30" : "text-muted-foreground")}>
                              {d.is_active ? (vigente ? 'Activo' : 'Vencido') : 'Inactivo'}
                            </Badge>
                            {d.es_recurrente && <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">Recurrente</Badge>}
                          </div>

                          {/* Valor */}
                          {d.valor_global != null && d.roles?.length === 0 && (
                            <p className="text-sm font-semibold text-primary">
                              {d.valor_global}{d.tipo_global === 'porcentaje' ? '%' : ' COP'} — aplica a todos
                            </p>
                          )}

                          {d.descripcion && <p className="text-sm text-muted-foreground truncate">{d.descripcion}</p>}

                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(d.fecha_inicio).toLocaleDateString('es-CO')}</span>
                            {d.fecha_fin && <span>→ {new Date(d.fecha_fin).toLocaleDateString('es-CO')}</span>}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {/* Roles */}
                            {d.roles && d.roles.length > 0 && d.roles.map(r => (
                              <Badge key={r.id} variant="secondary" className="text-xs">
                                {r.nombre}: {r.pivot.valor_descuento}{r.pivot.tipo_descuento === 'porcentaje' ? '%' : ' COP'}
                              </Badge>
                            ))}
                            {/* Servicios */}
                            {services.length > 0 ? services.map(s => (
                              <Badge key={s.id} variant="outline" className="text-xs" style={{ borderColor: s.primary_color ?? undefined, color: s.primary_color ?? undefined }}>
                                {s.name}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">Todos los servicios</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(d.id)} disabled={deletingId === d.id}>
                          {deletingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* ── Dialog ──────────────────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDesc ? 'Editar descuento' : 'Nuevo descuento'}</DialogTitle>
            <DialogDescription>Configura el alcance y valor del descuento</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Info básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Descuento Mayorista" /></div>
              <div className="space-y-1"><Label>Código (opcional)</Label><Input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="DESC20" /></div>
              <div className="space-y-1"><Label>Descripción (opcional)</Label><Input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción..." /></div>
              <div className="space-y-1"><Label>Fecha inicio *</Label><Input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha fin (opcional)</Label><Input type="date" value={form.fecha_fin} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} /></div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.es_recurrente} onCheckedChange={v => setForm(f => ({ ...f, es_recurrente: v }))} /><Label>Recurrente</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Activo</Label></div>
            </div>

            {/* ── Sección 1: Valor del descuento ─────────────────────────────── */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">1. Valor del descuento</p>

              {/* Global (cuando NO hay roles) */}
              <div className={cn("space-y-2 transition-opacity", hasRoles && "opacity-40 pointer-events-none")}>
                <Label className="text-xs text-muted-foreground">
                  Valor global <span className="text-primary">(para todos los clientes)</span>
                  {hasRoles && <span className="ml-2 text-yellow-500">— desactivado porque hay descuentos por rol</span>}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number" min="0" placeholder="20"
                      value={form.valor_global}
                      onChange={e => setForm(f => ({ ...f, valor_global: e.target.value }))}
                      disabled={hasRoles}
                    />
                  </div>
                  <select
                    value={form.tipo_global}
                    onChange={e => setForm(f => ({ ...f, tipo_global: e.target.value as any }))}
                    disabled={hasRoles}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="porcentaje">%</option>
                    <option value="fijo">COP</option>
                  </select>
                </div>
              </div>

              {/* Por rol */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Por rol <span className="text-primary">(valor específico por tipo de cliente)</span>
                    {hasRoles && <span className="ml-2 text-green-500">✓ activo — reemplaza el valor global</span>}
                  </Label>
                  {roles.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={addRol} className="text-xs h-7"><Plus className="w-3 h-3 mr-1" />Agregar rol</Button>
                  )}
                </div>
                {form.roles.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_80px_28px] gap-2 items-center">
                    <select value={r.role_id} onChange={e => updateRol(i, 'role_id', e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                      <option value="">Selecciona rol...</option>
                      {roles.map(rl => <option key={rl.id} value={rl.id}>{rl.nombre}</option>)}
                    </select>
                    <Input type="number" min="0" value={r.valor_descuento} onChange={e => updateRol(i, 'valor_descuento', e.target.value)} placeholder="20" className="h-9" />
                    <select value={r.tipo_descuento} onChange={e => updateRol(i, 'tipo_descuento', e.target.value as any)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                      <option value="porcentaje">%</option>
                      <option value="fijo">COP</option>
                    </select>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-7 text-destructive" onClick={() => removeRol(i)}><X className="w-3 h-3" /></Button>
                  </div>
                ))}
                {form.roles.length === 0 && <p className="text-xs text-muted-foreground">Sin roles específicos → aplica a todos con el valor global</p>}
              </div>
            </div>

            {/* ── Sección 2: Servicios (múltiples) ───────────────────────────── */}
            {servicios.length > 0 && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">2. Servicios aplicables</p>
                  <p className="text-xs text-muted-foreground">Ninguno seleccionado = aplica a todos los servicios</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {servicios.map(s => {
                    const selected = form.streaming_service_ids.includes(String(s.id))
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleServicio(String(s.id))}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg border-2 text-sm text-left transition-all",
                          selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.primary_color ?? '#6B7280' }} />
                        <span className="font-medium text-foreground truncate">{s.name}</span>
                        {selected && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                {form.streaming_service_ids.length === 0 && (
                  <p className="text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Aplica a todos los servicios</p>
                )}
              </div>
            )}

            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : editingDesc ? 'Guardar cambios' : 'Crear descuento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
