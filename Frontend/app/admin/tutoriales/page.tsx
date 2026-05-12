"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { FadeIn } from "@/components/animations/motion"
import {
  Play, Plus, Trash2, RefreshCw, Loader2, AlertCircle, Pencil, BookOpen, Tag, Youtube,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Tutorial, type TutorialCategoria } from "@/lib/api"

interface TutForm {
  titulo: string; descripcion: string; youtube_url: string
  duracion: string; categoria_id: string; is_active: boolean
}
const emptyTut: TutForm = { titulo: '', descripcion: '', youtube_url: '', duracion: '', categoria_id: '', is_active: true }

interface CatForm { nombre: string; descripcion: string; is_active: boolean }
const emptyCat: CatForm = { nombre: '', descripcion: '', is_active: true }

export default function AdminTutorialesPage() {
  const [tutoriales, setTutoriales] = useState<Tutorial[]>([])
  const [categorias, setCategorias] = useState<TutorialCategoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'tutoriales' | 'categorias'>('tutoriales')

  // Dialog tutorial
  const [tutDialog, setTutDialog] = useState(false)
  const [editingTut, setEditingTut] = useState<Tutorial | null>(null)
  const [tutForm, setTutForm] = useState<TutForm>(emptyTut)
  const [tutSaving, setTutSaving] = useState(false)
  const [tutError, setTutError] = useState<string | null>(null)
  const [deletingTut, setDeletingTut] = useState<number | null>(null)

  // Dialog categoría
  const [catDialog, setCatDialog] = useState(false)
  const [editingCat, setEditingCat] = useState<TutorialCategoria | null>(null)
  const [catForm, setCatForm] = useState<CatForm>(emptyCat)
  const [catSaving, setCatSaving] = useState(false)
  const [catError, setCatError] = useState<string | null>(null)
  const [deletingCat, setDeletingCat] = useState<number | null>(null)

  const load = async () => {
    setIsLoading(true); setError(null)
    try {
      const [t, c] = await Promise.all([api.getTutoriales(), api.getTutorialCategorias()])
      setTutoriales(t); setCategorias(c)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error cargando') }
    finally { setIsLoading(false) }
  }
  useEffect(() => { load() }, [])

  // ── Tutorial CRUD ────────────────────────────────────────────────────────

  const openCreateTut = () => { setEditingTut(null); setTutForm(emptyTut); setTutError(null); setTutDialog(true) }
  const openEditTut = (t: Tutorial) => {
    setEditingTut(t)
    setTutForm({
      titulo: t.titulo,
      descripcion: t.descripcion ?? '',
      youtube_url: t.youtube_url,
      duracion: t.duracion ?? '',
      categoria_id: t.categoria_id ? String(t.categoria_id) : '',
      is_active: t.is_active,
    })
    setTutError(null); setTutDialog(true)
  }

  const handleSaveTut = async () => {
    if (!tutForm.titulo.trim() || !tutForm.youtube_url.trim()) { setTutError('Título y URL de YouTube son requeridos'); return }
    setTutSaving(true); setTutError(null)
    try {
      const payload = {
        titulo: tutForm.titulo.trim(),
        descripcion: tutForm.descripcion.trim() || undefined,
        youtube_url: tutForm.youtube_url.trim(),
        duracion: tutForm.duracion.trim() || undefined,
        categoria_id: tutForm.categoria_id ? parseInt(tutForm.categoria_id) : undefined,
        is_active: tutForm.is_active,
      }
      if (editingTut) {
        const updated = await api.updateTutorial(editingTut.id, payload)
        setTutoriales(prev => prev.map(t => t.id === updated.id ? updated : t))
      } else {
        const created = await api.createTutorial(payload as any)
        setTutoriales(prev => [created, ...prev])
      }
      setTutDialog(false)
    } catch (err) { setTutError(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setTutSaving(false) }
  }

  const handleDeleteTut = async (id: number) => {
    if (!confirm('¿Eliminar este tutorial?')) return
    setDeletingTut(id)
    try { await api.deleteTutorial(id); setTutoriales(prev => prev.filter(t => t.id !== id)) }
    catch (err) { alert(err instanceof Error ? err.message : 'Error') }
    finally { setDeletingTut(null) }
  }

  // ── Categoría CRUD ───────────────────────────────────────────────────────

  const openCreateCat = () => { setEditingCat(null); setCatForm(emptyCat); setCatError(null); setCatDialog(true) }
  const openEditCat = (c: TutorialCategoria) => {
    setEditingCat(c)
    setCatForm({ nombre: c.nombre, descripcion: c.descripcion ?? '', is_active: c.is_active })
    setCatError(null); setCatDialog(true)
  }

  const handleSaveCat = async () => {
    if (!catForm.nombre.trim()) { setCatError('El nombre es requerido'); return }
    setCatSaving(true); setCatError(null)
    try {
      const payload = { nombre: catForm.nombre.trim(), descripcion: catForm.descripcion.trim() || undefined, is_active: catForm.is_active }
      if (editingCat) {
        const updated = await api.updateTutorialCategoria(editingCat.id, payload)
        setCategorias(prev => prev.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await api.createTutorialCategoria(payload)
        setCategorias(prev => [...prev, created])
      }
      setCatDialog(false)
    } catch (err) { setCatError(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setCatSaving(false) }
  }

  const handleDeleteCat = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Los tutoriales quedarán sin categoría.')) return
    setDeletingCat(id)
    try { await api.deleteTutorialCategoria(id); setCategorias(prev => prev.filter(c => c.id !== id)) }
    catch (err) { alert(err instanceof Error ? err.message : 'Error') }
    finally { setDeletingCat(null) }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Centro de tutoriales</h1>
          <p className="text-muted-foreground">Gestiona videos de YouTube y sus categorías</p>
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="tutoriales"><BookOpen className="w-4 h-4 mr-2" />Tutoriales ({tutoriales.length})</TabsTrigger>
          <TabsTrigger value="categorias"><Tag className="w-4 h-4 mr-2" />Categorías ({categorias.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tutoriales" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tutoriales</CardTitle>
                <CardDescription>Pega el link de YouTube y el thumbnail/embed se generan solos</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </Button>
                <Button className="bg-primary text-primary-foreground" onClick={openCreateTut}>
                  <Plus className="w-4 h-4 mr-2" />Nuevo tutorial
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              : error ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><AlertCircle className="w-10 h-10 text-red-500" /><p>{error}</p></div>
              : tutoriales.length === 0 ? <p className="text-center text-muted-foreground py-12">No hay tutoriales. Crea el primero.</p>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutoriales.map(t => (
                    <Card key={t.id} className="bg-secondary/30 border-border overflow-hidden">
                      <div className="relative aspect-video bg-black">
                        {t.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.thumbnail_url} alt={t.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <Youtube className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-10 h-10 text-white fill-white opacity-80" />
                        </div>
                        {t.duracion && (
                          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-none">{t.duracion}</Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-foreground line-clamp-1">{t.titulo}</h3>
                        {t.categoria && <Badge variant="outline" className="mt-1 text-xs text-primary border-primary/30">{t.categoria.nombre}</Badge>}
                        {t.descripcion && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.descripcion}</p>}
                        <div className="flex gap-1 mt-3">
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEditTut(t)}>
                            <Pencil className="w-3 h-3 mr-1" />Editar
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTut(t.id)} disabled={deletingTut === t.id}>
                            {deletingTut === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>Organiza tus tutoriales por categoría</CardDescription>
              </div>
              <Button className="bg-primary text-primary-foreground" onClick={openCreateCat}>
                <Plus className="w-4 h-4 mr-2" />Nueva categoría
              </Button>
            </CardHeader>
            <CardContent>
              {categorias.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Sin categorías. Crea la primera.</p>
              ) : (
                <div className="space-y-2">
                  {categorias.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><Tag className="w-4 h-4 text-primary" /></div>
                        <div>
                          <p className="font-medium text-foreground">{c.nombre}</p>
                          {c.descripcion && <p className="text-xs text-muted-foreground">{c.descripcion}</p>}
                        </div>
                        {!c.is_active && <Badge variant="outline" className="text-muted-foreground">Inactiva</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditCat(c)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCat(c.id)} disabled={deletingCat === c.id}>
                          {deletingCat === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tutorial Dialog */}
      <Dialog open={tutDialog} onOpenChange={setTutDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTut ? 'Editar tutorial' : 'Nuevo tutorial'}</DialogTitle>
            <DialogDescription>Pega el link del video — el thumbnail se genera automáticamente</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={tutForm.titulo} onChange={e => setTutForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Cómo activar Netflix" />
            </div>
            <div className="space-y-1">
              <Label>URL de YouTube *</Label>
              <Input value={tutForm.youtube_url} onChange={e => setTutForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-xs text-muted-foreground">Soporta youtube.com/watch, youtu.be y embed</p>
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Input value={tutForm.descripcion} onChange={e => setTutForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Breve descripción..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Duración</Label>
                <Input value={tutForm.duracion} onChange={e => setTutForm(f => ({ ...f, duracion: e.target.value }))} placeholder="5:30" />
              </div>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select value={tutForm.categoria_id} onChange={e => setTutForm(f => ({ ...f, categoria_id: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
                  <option value="">Sin categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={tutForm.is_active} onCheckedChange={v => setTutForm(f => ({ ...f, is_active: v }))} />
              <Label>Activo</Label>
            </div>
            {tutError && <p className="text-sm text-destructive">{tutError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setTutDialog(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSaveTut} disabled={tutSaving}>
              {tutSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : (editingTut ? 'Guardar cambios' : 'Crear tutorial')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categoría Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input value={catForm.nombre} onChange={e => setCatForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Configuración" />
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Input value={catForm.descripcion} onChange={e => setCatForm(f => ({ ...f, descripcion: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={catForm.is_active} onCheckedChange={v => setCatForm(f => ({ ...f, is_active: v }))} />
              <Label>Activa</Label>
            </div>
            {catError && <p className="text-sm text-destructive">{catError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setCatDialog(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleSaveCat} disabled={catSaving}>
              {catSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : (editingCat ? 'Guardar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
