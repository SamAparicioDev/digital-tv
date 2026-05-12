"use client"

import { useState, useEffect, useRef } from "react"
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
  Film, Tv2, Plus, Trash2, RefreshCw, Loader2, AlertCircle, Pencil, Upload, ImageIcon, X, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Estreno, type StreamingService } from "@/lib/api"

interface Form {
  titulo: string
  formato: 'pelicula' | 'serie'
  imagen: string
  is_active: boolean
  servicios: number[]
}

const empty: Form = { titulo: '', formato: 'pelicula', imagen: '', is_active: true, servicios: [] }

export default function AdminReleasesPage() {
  const [estrenos, setEstrenos] = useState<Estreno[]>([])
  const [servicios, setServicios] = useState<StreamingService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pelicula' | 'serie'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Estreno | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setIsLoading(true); setError(null)
    try {
      const [e, s] = await Promise.all([api.getEstrenos(), api.getStreamingServices()])
      setEstrenos(e); setServicios(s)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error cargando') }
    finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setImageFile(null); setImagePreview(null); setSaveError(null); setDialogOpen(true) }
  const openEdit = (e: Estreno) => {
    setEditing(e)
    setForm({
      titulo: e.titulo,
      formato: e.formato,
      imagen: e.imagen ?? '',
      is_active: e.is_active,
      servicios: (e.streaming_services ?? []).map(s => s.id),
    })
    setImagePreview(e.imagen_url)
    setImageFile(null); setSaveError(null); setDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const r = new FileReader()
    r.onloadend = () => setImagePreview(r.result as string)
    r.readAsDataURL(file)
  }

  const toggleServ = (id: number) => setForm(f => ({
    ...f, servicios: f.servicios.includes(id) ? f.servicios.filter(s => s !== id) : [...f.servicios, id],
  }))

  const handleSave = async () => {
    if (!form.titulo.trim()) { setSaveError('El título es requerido'); return }
    setIsSaving(true); setSaveError(null)
    try {
      let imagenUrl = form.imagen
      if (imageFile) {
        setIsUploadingImage(true)
        imagenUrl = await api.uploadImagen(imageFile, 'estrenos')
        setIsUploadingImage(false)
      }

      const payload = {
        titulo: form.titulo.trim(),
        formato: form.formato,
        imagen: imagenUrl || undefined,
        is_active: form.is_active,
        streaming_service_ids: form.servicios,
      }
      if (editing) {
        const updated = await api.updateEstreno(editing.id, payload)
        setEstrenos(prev => prev.map(e => e.id === updated.id ? updated : e))
      } else {
        const created = await api.createEstreno(payload as any)
        setEstrenos(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) { setSaveError(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setIsSaving(false); setIsUploadingImage(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este estreno?')) return
    setDeletingId(id)
    try { await api.deleteEstreno(id); setEstrenos(prev => prev.filter(e => e.id !== id)) }
    catch (err) { alert(err instanceof Error ? err.message : 'Error') }
    finally { setDeletingId(null) }
  }

  const filtered = filter === 'all' ? estrenos : estrenos.filter(e => e.formato === filter)

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Estrenos</h1>
            <p className="text-muted-foreground">Películas y series destacadas en la plataforma</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />Nuevo estreno
            </Button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="flex gap-2">
          {[{ key: 'all', label: 'Todos', icon: null }, { key: 'pelicula', label: 'Películas', icon: Film }, { key: 'serie', label: 'Series', icon: Tv2 }].map(f => (
            <Button key={f.key} variant={filter === f.key ? 'default' : 'outline'} size="sm"
              onClick={() => setFilter(f.key as typeof filter)}
              className={cn(filter === f.key ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary')}>
              {f.icon && <f.icon className="w-4 h-4 mr-1" />}{f.label}
            </Button>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        : error ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p><Button variant="outline" size="sm" onClick={load}>Reintentar</Button></div>
        : filtered.length === 0 ? <Card className="bg-card border-border"><CardContent className="py-12 text-center text-muted-foreground"><Film className="w-12 h-12 mx-auto mb-2 opacity-40" /><p>No hay estrenos. Crea el primero.</p></CardContent></Card>
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(e => (
              <Card key={e.id} className={cn("bg-card border-border overflow-hidden group", !e.is_active && "opacity-60")}>
                <div className="relative aspect-[2/3] bg-secondary">
                  {e.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.imagen_url} alt={e.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                      {e.formato === 'serie' ? <Tv2 className="w-12 h-12" /> : <Film className="w-12 h-12" />}
                    </div>
                  )}
                  <Badge className={cn("absolute top-2 left-2 border-none text-white", e.formato === 'serie' ? 'bg-blue-500' : 'bg-purple-500')}>
                    {e.formato === 'serie' ? 'Serie' : 'Película'}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-foreground line-clamp-1">{e.titulo}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(e.streaming_services ?? []).slice(0, 3).map(s => (
                      <Badge key={s.id} variant="outline" className="text-xs" style={{ borderColor: s.primary_color ?? undefined, color: s.primary_color ?? undefined }}>
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(e)}>
                      <Pencil className="w-3 h-3 mr-1" />Editar
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)} disabled={deletingId === e.id}>
                      {deletingId === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </FadeIn>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar estreno' : 'Nuevo estreno'}</DialogTitle>
            <DialogDescription>Define título, formato, servicios y portada</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Stranger Things" />
            </div>

            <div className="space-y-1">
              <Label>Formato *</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, formato: 'pelicula' }))}
                  className={cn("flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all", form.formato === 'pelicula' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                  <Film className="w-4 h-4" /><span className="text-sm font-medium">Película</span>
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, formato: 'serie' }))}
                  className={cn("flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all", form.formato === 'serie' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                  <Tv2 className="w-4 h-4" /><span className="text-sm font-medium">Serie</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Disponible en</Label>
              <div className="grid grid-cols-2 gap-2">
                {servicios.map(s => {
                  const sel = form.servicios.includes(s.id)
                  return (
                    <button key={s.id} type="button" onClick={() => toggleServ(s.id)}
                      className={cn("flex items-center gap-2 p-2 rounded-lg border text-sm transition-all", sel ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                      {sel && <Check className="w-3 h-3 text-primary" />}
                      <span className="truncate">{s.name}</span>
                    </button>
                  )
                })}
                {servicios.length === 0 && <p className="col-span-2 text-xs text-muted-foreground">No hay servicios. Crea servicios primero.</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Portada (imagen)</Label>
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-border bg-secondary/30" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => { setImageFile(null); setImagePreview(null); setForm(f => ({ ...f, imagen: '' })) }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all">
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Adjuntar portada</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Activo (visible en landing)</Label>
            </div>

            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSave} disabled={isSaving || isUploadingImage}>
              {isSaving || isUploadingImage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isUploadingImage ? 'Subiendo...' : 'Guardando...'}</> : <><Upload className="w-4 h-4 mr-2" />{editing ? 'Guardar cambios' : 'Crear estreno'}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
