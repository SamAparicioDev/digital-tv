"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FadeIn } from "@/components/animations/motion"
import { 
  Percent, 
  Plus, 
  ImageIcon,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

const initialPromotions = [
  {
    id: 1,
    title: "Netflix Premium",
    description: "30% de descuento en cuentas Premium 4K",
    discount: "30%",
    price: 11.19,
    originalPrice: 15.99,
    active: true,
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Disney+ Bundle",
    description: "25% de descuento en el paquete completo",
    discount: "25%",
    price: 14.99,
    originalPrice: 19.99,
    active: true,
    image: "https://images.unsplash.com/photo-1611162617474-e7098604235b?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    title: "HBO Max",
    description: "40% de descuento - Oferta limitada",
    discount: "40%",
    price: 8.99,
    originalPrice: 14.99,
    active: true,
    image: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Amazon Prime",
    description: "20% de descuento en suscripción anual",
    discount: "20%",
    price: 10.39,
    originalPrice: 12.99,
    active: false,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop",
  },
]

export default function AdminPromocionesPage() {
  const [promotions, setPromotions] = useState(initialPromotions)
  const [showAddForm, setShowAddForm] = useState(false)
  const [draggedId, setDraggedId] = useState<number | null>(null)

  const toggleActive = (id: number) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    )
  }

  const deletePromotion = (id: number) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDragStart = (id: number) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    if (draggedId === null || draggedId === id) return

    const newPromotions = [...promotions]
    const draggedIndex = newPromotions.findIndex((p) => p.id === draggedId)
    const targetIndex = newPromotions.findIndex((p) => p.id === id)
    
    const [removed] = newPromotions.splice(draggedIndex, 1)
    newPromotions.splice(targetIndex, 0, removed)
    
    setPromotions(newPromotions)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gestión de promociones
            </h1>
            <p className="text-muted-foreground">
              Administra las promociones visibles en la landing page
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva promoción
          </Button>
        </div>
      </FadeIn>

      {/* Add Form */}
      {showAddForm && (
        <FadeIn>
          <Card className="bg-card border-border border-primary/30">
            <CardHeader>
              <CardTitle>Nueva promoción</CardTitle>
              <CardDescription>Crea una nueva promoción para mostrar en la landing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input placeholder="Ej: Netflix Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input placeholder="Ej: 30% de descuento en cuentas Premium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Precio original</Label>
                      <Input type="number" placeholder="15.99" />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio con descuento</Label>
                      <Input type="number" placeholder="11.19" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagen</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors duration-200 cursor-pointer">
                      <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Arrastra una imagen o haz clic para subir
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG hasta 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
                <Button className="bg-primary text-primary-foreground">
                  Guardar promoción
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Promotions List */}
      <FadeIn delay={0.2}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Promociones activas</CardTitle>
            <CardDescription>
              Arrastra para reordenar las promociones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {promotions.map((promo, index) => (
                <div
                  key={promo.id}
                  draggable
                  onDragStart={() => handleDragStart(promo.id)}
                  onDragOver={(e) => handleDragOver(e, promo.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                    promo.active ? "border-border" : "border-border/50 opacity-60",
                    draggedId === promo.id && "scale-[1.02] shadow-lg border-primary",
                    "hover:border-primary/30 cursor-grab active:cursor-grabbing"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={promo.image || "/placeholder.svg"}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{promo.title}</h3>
                      <Badge className="bg-primary/20 text-primary">
                        -{promo.discount}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {promo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <p className="font-bold text-foreground">${promo.price}</p>
                      <p className="text-xs text-muted-foreground line-through">
                        ${promo.originalPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {promo.active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={promo.active}
                        onCheckedChange={() => toggleActive(promo.id)}
                      />
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deletePromotion(promo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
