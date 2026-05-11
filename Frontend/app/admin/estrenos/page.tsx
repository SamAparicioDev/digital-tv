"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FadeIn } from "@/components/animations/motion"
import {
  Tv, Plus, Search, Pencil, Trash2, RefreshCw, Loader2, AlertCircle, CheckCircle, XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type StreamingService } from "@/lib/api"

interface FormData {
  name: string
  logo_url: string
  primary_color: string
  cantidad_cuentas: string
  is_active: boolean
}

const emptyForm: FormData = { name: '', logo_url: '', primary_color: '#6B7280', cantidad_cuentas: '0', is_active: true }

export default function AdminEstrennosPage() {
  const [services, setServices] = useState<StreamingService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<StreamingService | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getStreamingServices()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando servicios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingService(null)
    setForm(emptyForm)
    setSaveError(null)
    setDialogOpen(true)
  }

  const openEdit = (s: StreamingService) => {
    setEditingService(s)
    setForm({
      name: s.name,
      logo_url: s.logo_url ?? '',
      primary_color: s.primary_color ?? '#6B7280',
      cantidad_cuentas: String(s.cantidad_cuentas),
      is_active: s.is_active,
    })
    setSaveError(null)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveError('El nombre es requerido'); return }
    setIsSaving(true)
    setSaveError(null)
    try {
      const payload = {
        name: form.name,
        logo_url: form.logo_url || undefined,
        primary_color: form.primary_color,
        cantidad_cuentas: parseInt(form.cantidad_cuentas) || 0,
        is_active: form.is_active,
      }
      if (editingService) {
        const updated = await api.updateStreamingService(editingService.id, payload)
        setServices((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      } else {
        const created = await api.createStreamingService(payload)
        setServices((prev) => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await api.deleteStreamingService(id)
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando servicio')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Servicios de Streaming</h1>
            <p className="text-muted-foreground">Plataformas disponibles en el catálogo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo servicio
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total servicios', value: services.length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Activos', value: services.filter((s) => s.is_active).length, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total cuentas', value: services.reduce((s, x) => s + x.cantidad_cuentas, 0), color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((st, i) => (
          <FadeIn key={st.label} delay={i * 0.1}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", st.bg)}>
                    <Tv className={cn("w-5 h-5", st.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{st.label}</p>
                    <p className="text-xl font-bold text-foreground">{st.value.toLocaleString('es-CO')}</p>
                  </div>
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
              <Input
                placeholder="Buscar servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.3}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{filtered.length} servicios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Servicio</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Cuentas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow key={s.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {s.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.logo_url} alt={s.name} className="w-8 h-8 rounded object-contain bg-secondary" />
                            ) : (
                              <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: s.primary_color ?? '#6B7280' }}>
                                {s.name.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-foreground">{s.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{s.slug}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: s.primary_color ?? '#6B7280' }} />
                            <span className="text-xs text-muted-foreground font-mono">{s.primary_color}</span>
                          </div>
                        </TableCell>
                        <TableCell>{s.cantidad_cuentas}</TableCell>
                        <TableCell>
                          {s.is_active ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" /> Activo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="w-3 h-3 mr-1" /> Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                            >
                              {deletingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No hay servicios registrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Editar servicio' : 'Nuevo servicio de streaming'}</DialogTitle>
            <DialogDescription>Completa los campos del servicio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Netflix" />
            </div>
            <div className="space-y-2">
              <Label>URL del logo (opcional)</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color primario</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer border border-border" />
                  <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cantidad de cuentas</Label>
                <Input type="number" min="0" value={form.cantidad_cuentas} onChange={(e) => setForm({ ...form, cantidad_cuentas: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Activo</Label>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : editingService ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
