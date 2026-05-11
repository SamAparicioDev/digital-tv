"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Monitor, Search, RefreshCw, Loader2, AlertCircle, Package, Check, X,
  Layers, Clock, ShoppingBag, Trash2, Plus, Pencil,
} from "lucide-react"
import { cn, formatCOP } from "@/lib/utils"
import { api, type Oferta, type StreamingService } from "@/lib/api"

interface ServicioRow { streaming_service_id: string; numero_perfiles: string; duracion_dias: string }
interface OfertaForm {
  precio: string; stock: string; garantia_dias: string
  cuenta_completa: boolean; is_active: boolean; servicios: ServicioRow[]
}
const emptyForm: OfertaForm = { precio: '', stock: '', garantia_dias: '0', cuenta_completa: false, is_active: true, servicios: [{ streaming_service_id: '', numero_perfiles: '1', duracion_dias: '30' }] }

export default function AdminPantallasPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [streamingServices, setStreamingServices] = useState<StreamingService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOferta, setEditingOferta] = useState<Oferta | null>(null)
  const [form, setForm] = useState<OfertaForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true); setError(null)
    try {
      const [o, s] = await Promise.all([api.getOfertas(), api.getStreamingServices()])
      setOfertas(o); setStreamingServices(s)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error cargando') }
    finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditingOferta(null); setForm(emptyForm); setSaveError(null); setDialogOpen(true) }
  const openEdit = (o: Oferta) => {
    setEditingOferta(o)
    setForm({ precio: String(o.precio), stock: String(o.stock), garantia_dias: String(o.garantia_dias), cuenta_completa: o.cuenta_completa, is_active: o.is_active, servicios: o.servicios.length > 0 ? o.servicios.map(s => ({ streaming_service_id: String(s.id), numero_perfiles: String(s.pivot.numero_perfiles), duracion_dias: String(s.pivot.duracion_dias) })) : [{ streaming_service_id: '', numero_perfiles: '1', duracion_dias: '30' }] })
    setSaveError(null); setDialogOpen(true)
  }

  const addServicio = () => setForm(f => ({ ...f, servicios: [...f.servicios, { streaming_service_id: '', numero_perfiles: '1', duracion_dias: '30' }] }))
  const removeServicio = (i: number) => setForm(f => ({ ...f, servicios: f.servicios.filter((_, idx) => idx !== i) }))
  const updateServicio = (i: number, key: keyof ServicioRow, val: string) => setForm(f => ({ ...f, servicios: f.servicios.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }))

  const handleSave = async () => {
    if (!form.precio || !form.stock) { setSaveError('Precio y stock son requeridos'); return }
    if (form.servicios.some(s => !s.streaming_service_id)) { setSaveError('Selecciona un servicio para cada fila'); return }
    setIsSaving(true); setSaveError(null)
    try {
      const payload = { precio: parseFloat(form.precio), stock: parseInt(form.stock), garantia_dias: parseInt(form.garantia_dias) || 0, cuenta_completa: form.cuenta_completa, is_active: form.is_active, servicios_incluidos: form.servicios.map(s => ({ streaming_service_id: parseInt(s.streaming_service_id), numero_perfiles: parseInt(s.numero_perfiles) || 1, duracion_dias: parseInt(s.duracion_dias) || 30 })) }
      if (editingOferta) {
        const updated = await api.updateOferta(editingOferta.id, payload as any)
        setOfertas(prev => prev.map(o => o.id === updated.id ? updated : o))
      } else {
        const created = await api.createOferta(payload)
        setOfertas(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) { setSaveError(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setIsSaving(false) }
  }

  const handleToggleActive = async (oferta: Oferta) => {
    try {
      const updated = await api.updateOferta(oferta.id, { is_active: !oferta.is_active })
      setOfertas(prev => prev.map(o => o.id === updated.id ? updated : o))
    } catch (err) { alert(err instanceof Error ? err.message : 'Error') }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await api.deleteOferta(id); setOfertas(prev => prev.filter(o => o.id !== id)) }
    catch (err) { alert(err instanceof Error ? err.message : 'Error eliminando') }
    finally { setDeletingId(null) }
  }

  const filtered = ofertas.filter(o => {
    const label = o.servicios.map(s => s.name).join(' ').toLowerCase()
    const matchSearch = label.includes(searchQuery.toLowerCase())
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? o.is_active : !o.is_active)
    return matchSearch && matchActive
  })

  return (
    <Suspense>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Ofertas</h1>
              <p className="text-muted-foreground">Paquetes de streaming disponibles para la venta</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
              <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Nueva oferta
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: ofertas.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Activas', value: ofertas.filter(o => o.is_active).length, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Inactivas', value: ofertas.filter(o => !o.is_active).length, icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Stock total', value: ofertas.reduce((s, o) => s + o.stock, 0), icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", s.bg)}><s.icon className={cn("w-5 h-5", s.color)} /></div>
                    <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Filters */}
        <FadeIn delay={0.2}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar por servicio..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="flex gap-2">
                  {[{ key: 'all', label: 'Todas' }, { key: 'active', label: 'Activas' }, { key: 'inactive', label: 'Inactivas' }].map(f => (
                    <Button key={f.key} variant={filterActive === f.key ? 'default' : 'outline'} size="sm" onClick={() => setFilterActive(f.key as any)} className={cn(filterActive === f.key ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary')}>{f.label}</Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Grid */}
        <FadeIn delay={0.3}>
          {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          : error ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p><Button variant="outline" size="sm" onClick={load}>Reintentar</Button></div>
          : filtered.length === 0 ? <div className="text-center text-muted-foreground py-12"><Monitor className="w-12 h-12 mx-auto mb-2 opacity-40" /><p>No hay ofertas registradas</p></div>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(oferta => {
                const serviceName = oferta.servicios.length > 0 ? oferta.servicios.map(s => s.name).join(' + ') : `Oferta #${oferta.id}`
                const color = oferta.servicios[0]?.primary_color ?? '#6B7280'
                return (
                  <Card key={oferta.id} className={cn("bg-card border-border overflow-hidden", !oferta.is_active && "opacity-60")}>
                    <div className="h-1" style={{ backgroundColor: color }} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{serviceName}</h3>
                          <p className="text-2xl font-bold text-primary mt-1">{formatCOP(oferta.precio)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className={cn("text-xs", oferta.is_active ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30")}>{oferta.is_active ? 'Activa' : 'Inactiva'}</Badge>
                          {oferta.cuenta_completa && <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">Cuenta completa</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        {oferta.servicios.map(s => (
                          <div key={s.id} className="flex items-center justify-between text-sm text-muted-foreground bg-secondary/30 rounded px-3 py-1.5">
                            <span className="font-medium text-foreground">{s.name}</span>
                            <span className="flex items-center gap-2"><Monitor className="w-3 h-3" />{s.pivot.numero_perfiles}p<Clock className="w-3 h-3 ml-1" />{s.pivot.duracion_dias}d</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="flex items-center gap-1 text-muted-foreground"><ShoppingBag className="w-4 h-4" />Stock: <span className={cn("font-semibold ml-1", oferta.stock > 0 ? 'text-foreground' : 'text-red-500')}>{oferta.stock}</span></span>
                        {oferta.garantia_dias > 0 && <span className="text-muted-foreground text-xs">Garantía {oferta.garantia_dias}d</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleToggleActive(oferta)}>
                          {oferta.is_active ? <><X className="w-4 h-4 mr-1" />Desactivar</> : <><Check className="w-4 h-4 mr-1" />Activar</>}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(oferta)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => handleDelete(oferta.id)} disabled={deletingId === oferta.id}>
                          {deletingId === oferta.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </FadeIn>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOferta ? 'Editar oferta' : 'Nueva oferta'}</DialogTitle>
            <DialogDescription>Define servicios, precio y condiciones</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Servicios incluidos *</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addServicio} className="text-xs h-7"><Plus className="w-3 h-3 mr-1" />Agregar</Button>
              </div>
              {form.servicios.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_72px_72px_28px] gap-2 items-end">
                  <div>
                    <Label className="text-xs text-muted-foreground">Servicio</Label>
                    <select value={s.streaming_service_id} onChange={e => updateServicio(i, 'streaming_service_id', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm mt-1">
                      <option value="">Selecciona...</option>
                      {streamingServices.map(sv => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
                    </select>
                  </div>
                  <div><Label className="text-xs text-muted-foreground">Perfiles</Label><Input type="number" min="0" value={s.numero_perfiles} onChange={e => updateServicio(i, 'numero_perfiles', e.target.value)} className="mt-1 h-9" /></div>
                  <div><Label className="text-xs text-muted-foreground">Días</Label><Input type="number" min="1" value={s.duracion_dias} onChange={e => updateServicio(i, 'duracion_dias', e.target.value)} className="mt-1 h-9" /></div>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-7 text-destructive mt-5" onClick={() => removeServicio(i)} disabled={form.servicios.length === 1}><X className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Precio (COP) *</Label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span><Input type="number" min="0" placeholder="15000" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} className="pl-7" /></div>
              </div>
              <div className="space-y-1"><Label>Stock *</Label><Input type="number" min="0" placeholder="10" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Garantía (días)</Label><Input type="number" min="0" placeholder="0" value={form.garantia_dias} onChange={e => setForm(f => ({ ...f, garantia_dias: e.target.value }))} /></div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.cuenta_completa} onCheckedChange={v => setForm(f => ({ ...f, cuenta_completa: v }))} /><Label>Cuenta completa</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Activa</Label></div>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : editingOferta ? 'Guardar cambios' : 'Crear oferta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Suspense>
  )
}
