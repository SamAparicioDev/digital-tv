"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/motion"
import {
  Film,
  Tv2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Calendar,
  ImageIcon,
  Play,
  TrendingUp,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Release {
  id: number
  title: string
  type: "Película" | "Serie"
  platform: string
  rating: number
  year: number
  genre: string
  isNew: boolean
  isVisible: boolean
  image: string
  description: string
  trailerUrl: string
  addedAt: string
  views: number
}

const initialReleases: Release[] = [
  {
    id: 1,
    title: "El Problema de los 3 Cuerpos",
    type: "Serie",
    platform: "Netflix",
    rating: 8.7,
    year: 2024,
    genre: "Ciencia Ficción",
    isNew: true,
    isVisible: true,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
    description: "Una civilización alienígena al borde de la destrucción contacta con la Tierra.",
    trailerUrl: "https://youtube.com/watch?v=example1",
    addedAt: "2024-03-15",
    views: 15420,
  },
  {
    id: 2,
    title: "Dune: Parte Dos",
    type: "Película",
    platform: "HBO Max",
    rating: 9.1,
    year: 2024,
    genre: "Ciencia Ficción",
    isNew: true,
    isVisible: true,
    image: "https://images.unsplash.com/photo-1608346128025-1896b97a6fa7?w=400&h=600&fit=crop",
    description: "Paul Atreides se une a los Fremen mientras busca venganza.",
    trailerUrl: "https://youtube.com/watch?v=example2",
    addedAt: "2024-03-01",
    views: 28350,
  },
  {
    id: 3,
    title: "Shogun",
    type: "Serie",
    platform: "Disney+",
    rating: 9.0,
    year: 2024,
    genre: "Drama Histórico",
    isNew: true,
    isVisible: true,
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=600&fit=crop",
    description: "Un náufrago inglés en el Japón feudal se ve envuelto en luchas de poder.",
    trailerUrl: "https://youtube.com/watch?v=example3",
    addedAt: "2024-02-27",
    views: 19870,
  },
  {
    id: 4,
    title: "The Bear",
    type: "Serie",
    platform: "Disney+",
    rating: 8.9,
    year: 2024,
    genre: "Drama",
    isNew: false,
    isVisible: true,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop",
    description: "Un chef de alta cocina regresa a Chicago para dirigir el restaurante familiar.",
    trailerUrl: "https://youtube.com/watch?v=example4",
    addedAt: "2024-01-15",
    views: 22100,
  },
  {
    id: 5,
    title: "Oppenheimer",
    type: "Película",
    platform: "Amazon Prime",
    rating: 8.8,
    year: 2023,
    genre: "Biografía",
    isNew: false,
    isVisible: true,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
    description: "La historia del físico que lideró el Proyecto Manhattan.",
    trailerUrl: "https://youtube.com/watch?v=example5",
    addedAt: "2023-12-20",
    views: 45200,
  },
  {
    id: 6,
    title: "House of the Dragon",
    type: "Serie",
    platform: "HBO Max",
    rating: 8.5,
    year: 2024,
    genre: "Fantasía",
    isNew: true,
    isVisible: false,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    description: "La historia de la Casa Targaryen, 200 años antes de los eventos de Game of Thrones.",
    trailerUrl: "https://youtube.com/watch?v=example6",
    addedAt: "2024-03-10",
    views: 31500,
  },
]

const platforms = ["Netflix", "HBO Max", "Disney+", "Amazon Prime", "Paramount+", "Apple TV+"]
const genres = ["Ciencia Ficción", "Drama", "Comedia", "Acción", "Terror", "Fantasía", "Biografía", "Drama Histórico", "Post-apocalíptico", "Thriller"]

export default function AdminEstrennosPage() {
  const [releases, setReleases] = useState<Release[]>(initialReleases)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all")
  const [filterPlatform, setFilterPlatform] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    type: "Película" as "Película" | "Serie",
    platform: "Netflix",
    rating: "8.0",
    year: new Date().getFullYear().toString(),
    genre: "Drama",
    isNew: true,
    isVisible: true,
    image: "",
    description: "",
    trailerUrl: "",
  })

  const filteredReleases = releases.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || 
      (filterType === "movie" && r.type === "Película") ||
      (filterType === "series" && r.type === "Serie")
    const matchesPlatform = filterPlatform === "all" || r.platform === filterPlatform
    return matchesSearch && matchesType && matchesPlatform
  })

  const stats = {
    total: releases.length,
    movies: releases.filter(r => r.type === "Película").length,
    series: releases.filter(r => r.type === "Serie").length,
    newReleases: releases.filter(r => r.isNew).length,
    totalViews: releases.reduce((acc, r) => acc + r.views, 0),
  }

  const resetForm = () => {
    setFormData({
      title: "",
      type: "Película",
      platform: "Netflix",
      rating: "8.0",
      year: new Date().getFullYear().toString(),
      genre: "Drama",
      isNew: true,
      isVisible: true,
      image: "",
      description: "",
      trailerUrl: "",
    })
  }

  const handleAddRelease = () => {
    const newRelease: Release = {
      id: Date.now(),
      title: formData.title,
      type: formData.type,
      platform: formData.platform,
      rating: parseFloat(formData.rating),
      year: parseInt(formData.year),
      genre: formData.genre,
      isNew: formData.isNew,
      isVisible: formData.isVisible,
      image: formData.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
      description: formData.description,
      trailerUrl: formData.trailerUrl,
      addedAt: new Date().toISOString().split('T')[0],
      views: 0,
    }
    setReleases([newRelease, ...releases])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditRelease = () => {
    if (!editingRelease) return
    setReleases(releases.map(r => 
      r.id === editingRelease.id 
        ? {
            ...r,
            title: formData.title,
            type: formData.type,
            platform: formData.platform,
            rating: parseFloat(formData.rating),
            year: parseInt(formData.year),
            genre: formData.genre,
            isNew: formData.isNew,
            isVisible: formData.isVisible,
            image: formData.image,
            description: formData.description,
            trailerUrl: formData.trailerUrl,
          }
        : r
    ))
    setEditingRelease(null)
    resetForm()
  }

  const handleDeleteRelease = (id: number) => {
    setReleases(releases.filter(r => r.id !== id))
    setDeleteConfirmId(null)
  }

  const toggleVisibility = (id: number) => {
    setReleases(releases.map(r => 
      r.id === id ? { ...r, isVisible: !r.isVisible } : r
    ))
  }

  const openEditDialog = (release: Release) => {
    setFormData({
      title: release.title,
      type: release.type,
      platform: release.platform,
      rating: release.rating.toString(),
      year: release.year.toString(),
      genre: release.genre,
      isNew: release.isNew,
      isVisible: release.isVisible,
      image: release.image,
      description: release.description,
      trailerUrl: release.trailerUrl,
    })
    setEditingRelease(release)
  }

  const ReleaseForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Nombre del título"
            className="bg-secondary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "Película" | "Serie") => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Película">Película</SelectItem>
              <SelectItem value="Serie">Serie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="platform">Plataforma</Label>
          <Select
            value={formData.platform}
            onValueChange={(value) => setFormData({ ...formData, platform: value })}
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Género</Label>
          <Select
            value={formData.genre}
            onValueChange={(value) => setFormData({ ...formData, genre: value })}
          >
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="bg-secondary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Año</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="bg-secondary/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Opciones</Label>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.isNew}
                onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
              />
              <span className="text-sm">Nuevo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
              />
              <span className="text-sm">Visible</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">URL de imagen</Label>
        <div className="flex gap-2">
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="bg-secondary/50"
          />
          <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trailer">URL del trailer</Label>
        <Input
          id="trailer"
          value={formData.trailerUrl}
          onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="bg-secondary/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Sinopsis del título..."
          className="bg-secondary/50 min-h-[80px]"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gestión de Estrenos
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra el catálogo de películas y series
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Estreno
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Estreno</DialogTitle>
                <DialogDescription>
                  Completa los datos del nuevo título para agregarlo al catálogo
                </DialogDescription>
              </DialogHeader>
              <ReleaseForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="bg-transparent">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddRelease}
                  disabled={!formData.title}
                  className="bg-primary text-primary-foreground"
                >
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StaggerItem>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Film className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Film className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.movies}</p>
                  <p className="text-xs text-muted-foreground">Películas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Tv2 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.series}</p>
                  <p className="text-xs text-muted-foreground">Series</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Clock className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.newReleases}</p>
                  <p className="text-xs text-muted-foreground">Nuevos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{(stats.totalViews / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Vistas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Filters */}
      <FadeIn delay={0.2}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(v: typeof filterType) => setFilterType(v)}>
                  <SelectTrigger className="w-[140px] bg-secondary/50">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="movie">Películas</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="w-[160px] bg-secondary/50">
                    <SelectValue placeholder="Plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {platforms.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.3}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              Catálogo ({filteredReleases.length} títulos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Título</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Plataforma</TableHead>
                    <TableHead className="text-muted-foreground">Rating</TableHead>
                    <TableHead className="text-muted-foreground">Año</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground">Vistas</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReleases.map((release) => (
                    <TableRow key={release.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-md overflow-hidden bg-secondary shrink-0">
                            <img
                              src={release.image || "/placeholder.svg"}
                              alt={release.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{release.title}</p>
                            <p className="text-xs text-muted-foreground">{release.genre}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "border",
                          release.type === "Película" 
                            ? "border-blue-500/50 text-blue-500" 
                            : "border-purple-500/50 text-purple-500"
                        )}>
                          {release.type === "Película" ? (
                            <Film className="w-3 h-3 mr-1" />
                          ) : (
                            <Tv2 className="w-3 h-3 mr-1" />
                          )}
                          {release.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                          {release.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          <span className="font-medium">{release.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {release.year}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {release.isNew && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Nuevo
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleVisibility(release.id)}
                          >
                            {release.isVisible ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {release.views.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem 
                              onClick={() => openEditDialog(release)}
                              className="cursor-pointer"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {release.trailerUrl && (
                              <DropdownMenuItem className="cursor-pointer">
                                <Play className="w-4 h-4 mr-2" />
                                Ver trailer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => setDeleteConfirmId(release.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Edit Dialog */}
      <Dialog open={editingRelease !== null} onOpenChange={(open) => !open && setEditingRelease(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Estreno</DialogTitle>
            <DialogDescription>
              Modifica los datos del título seleccionado
            </DialogDescription>
          </DialogHeader>
          <ReleaseForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRelease(null)} className="bg-transparent">
              Cancelar
            </Button>
            <Button 
              onClick={handleEditRelease}
              disabled={!formData.title}
              className="bg-primary text-primary-foreground"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El título será eliminado permanentemente del catálogo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="bg-transparent">
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteRelease(deleteConfirmId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
