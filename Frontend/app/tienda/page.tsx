"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  ShoppingCart,
  Clock,
  Monitor,
  Zap,
  Check,
  Loader2,
  AlertCircle,
  Wallet,
  PackageCheck,
} from "lucide-react";
import { Header } from "@/components/landing/header"
import { useRouter } from "next/navigation";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/landing/whatsapp-button";
import { useAuth } from "@/contexts/auth-context";
import { api, type Oferta, type Compra, type DatosAcceso, type Descuento } from "@/lib/api";
import { cn, formatCOP } from "@/lib/utils";
import { calcularDescuento } from "@/lib/discount";
import { Tag, User, Users as UsersIcon } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ofertaLabel(oferta: Oferta): string {
  if (oferta.servicios.length === 0) return `Oferta #${oferta.id}`
  if (oferta.servicios.length === 1) return oferta.servicios[0].name
  return oferta.servicios.map((s) => s.name).join(' + ')
}

function ofertaCategory(oferta: Oferta): string {
  return oferta.servicios[0]?.name ?? 'Streaming'
}

function ofertaDuration(oferta: Oferta): string {
  const dias = oferta.servicios[0]?.pivot?.duracion_dias
  if (!dias) return '30 días'
  return dias === 30 ? '1 mes' : `${dias} días`
}

function ofertaScreens(oferta: Oferta): number {
  const pivot = oferta.servicios[0]?.pivot?.numero_perfiles ?? 1
  // Cuenta completa siempre da acceso a múltiples perfiles internos
  // (Netflix=4, Disney+=7, etc.) — mínimo 4 como default sensato
  return oferta.cuenta_completa ? Math.max(pivot, 4) : pivot
}

function ofertaFeatures(oferta: Oferta): string[] {
  const feats: string[] = []
  if (oferta.cuenta_completa) feats.push('Cuenta completa')
  if (oferta.garantia_dias > 0) feats.push(`Garantía ${oferta.garantia_dias} días`)
  oferta.servicios.forEach((s) => {
    if (s.pivot.numero_perfiles > 1) feats.push(`${s.pivot.numero_perfiles} perfiles`)
  })
  if (feats.length === 0) feats.push('Acceso directo')
  return feats
}

function ofertaImage(oferta: Oferta): string {
  return oferta.servicios[0]?.logo_url ?? '/placeholder.svg?height=200&width=300'
}

// ─── Component ────────────────────────────────────────────────────────────────

const LoadingCard = () => null;

export default function StorePage() {
  const { user, isAuthenticated, activeRole, refreshUser } = useAuth();
  const router = useRouter();

  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [isLoadingOfertas, setIsLoadingOfertas] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("popular");

  const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<Compra | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Load offers + discounts
  useEffect(() => {
    if (!isAuthenticated) { setIsLoadingOfertas(false); return }
    setIsLoadingOfertas(true)
    Promise.all([
      api.getOfertas().then((data) => setOfertas(data.filter((o) => o.is_active && o.stock > 0))).catch((err) => { setLoadError(err.message ?? 'Error cargando ofertas') }),
      api.getDescuentos().then(setDescuentos).catch(() => {}),
    ]).finally(() => setIsLoadingOfertas(false))
  }, [isAuthenticated])

  // Calcular precio con descuento por oferta (memoizado por id)
  const getPriceInfo = (oferta: Oferta) => calcularDescuento(oferta, descuentos, activeRole?.id ?? null)

  // Derive categories from backend data
  const categories = ['Todos', ...Array.from(new Set(ofertas.flatMap((o) => o.servicios.map((s) => s.name))))]

  const filteredOfertas = ofertas
    .filter((o) => {
      const label = ofertaLabel(o).toLowerCase()
      const matchesSearch = label.includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'Todos' || o.servicios.some((s) => s.name === selectedCategory)
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const ap = getPriceInfo(a).precioFinal
      const bp = getPriceInfo(b).precioFinal
      switch (sortBy) {
        case 'price-low': return ap - bp
        case 'price-high': return bp - ap
        default: return b.stock - a.stock
      }
    })

  const handlePurchase = async (oferta: Oferta) => {
    if (!isAuthenticated) { setShowAuthPrompt(true); return }
    const price = getPriceInfo(oferta).precioFinal
    if (!user || user.balance < price) {
      setPurchaseError('Saldo insuficiente. Recarga tu saldo antes de comprar.')
      return
    }
    setIsPurchasing(true)
    setPurchaseError(null)
    try {
      const result = await api.createCompra(oferta.id)
      await refreshUser()
      setOfertas((prev) => prev.map((o) =>
        o.id === oferta.id ? { ...o, stock: Math.max(0, o.stock - 1) } : o
      ).filter((o) => o.stock > 0))
      setPurchaseSuccess(result.compra)
      setSelectedOferta(null)
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : 'Error al procesar la compra')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => router.push('/dashboard')} />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Tienda de <span className="text-primary">Streaming</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Encuentra las mejores ofertas de streaming al mejor precio
              </p>
              {isAuthenticated && user && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Tu saldo: </span>
                  <span className="font-bold text-primary">
                    {formatCOP(user.balance)}
                  </span>
                </div>
              )}
              {!isAuthenticated && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Inicia sesión para ver las ofertas disponibles
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        {isAuthenticated && (
          <section className="py-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ofertas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Mayor stock</SelectItem>
                    <SelectItem value="price-low">Menor precio</SelectItem>
                    <SelectItem value="price-high">Mayor precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoadingOfertas ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p>{loadError}</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-24 text-muted-foreground">
                <p className="text-lg">Inicia sesión para ver las ofertas disponibles.</p>
              </div>
            ) : filteredOfertas.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <p>No hay ofertas disponibles en este momento.</p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-8">
                  {filteredOfertas.length} oferta{filteredOfertas.length !== 1 ? 's' : ''} encontrada{filteredOfertas.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredOfertas.map((oferta, index) => {
                      const priceInfo = getPriceInfo(oferta)
                      const tieneDescuento = priceInfo.descuento !== null && priceInfo.precioFinal < priceInfo.precioOriginal
                      return (
                      <motion.div
                        key={oferta.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="bg-card border-border overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300"
                          onClick={() => { setSelectedOferta(oferta); setPurchaseError(null) }}
                        >
                          <div className="relative aspect-video bg-secondary flex items-center justify-center overflow-hidden">
                            {oferta.servicios[0]?.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={oferta.servicios[0].logo_url}
                                alt={ofertaLabel(oferta)}
                                className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <Monitor className="w-16 h-16 text-muted-foreground/40" />
                            )}
                            {/* Tipo de venta — clarito en la esquina superior izquierda */}
                            <Badge className={cn(
                              "absolute top-3 left-3 border-none",
                              oferta.cuenta_completa ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                            )}>
                              {oferta.cuenta_completa
                                ? <><UsersIcon className="w-3 h-3 mr-1" />Cuenta completa</>
                                : <><User className="w-3 h-3 mr-1" />1 perfil</>}
                            </Badge>
                            {/* Discount badge */}
                            {tieneDescuento && (
                              <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none">
                                <Tag className="w-3 h-3 mr-1" />-{priceInfo.porcentajeAhorro}%
                              </Badge>
                            )}
                            {!tieneDescuento && oferta.stock <= 5 && (
                              <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
                                ¡Últimas {oferta.stock}!
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {ofertaLabel(oferta)}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {ofertaDuration(oferta)}
                              </span>
                              <span className="flex items-center gap-1">
                                {oferta.cuenta_completa
                                  ? <><UsersIcon className="w-4 h-4" />{ofertaScreens(oferta)} perfiles incluidos</>
                                  : <><User className="w-4 h-4" />Perfil personal</>}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                {tieneDescuento && (
                                  <span className="text-xs text-muted-foreground line-through block">
                                    {formatCOP(priceInfo.precioOriginal)}
                                  </span>
                                )}
                                <span className="text-xl font-bold text-primary">
                                  {formatCOP(priceInfo.precioFinal)}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                disabled={oferta.stock === 0}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                onClick={(e) => { e.stopPropagation(); setSelectedOferta(oferta); setPurchaseError(null) }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Oferta Detail Modal */}
      <Dialog open={!!selectedOferta} onOpenChange={() => { setSelectedOferta(null); setPurchaseError(null) }}>
        <DialogContent className="bg-card border-border max-w-lg">
          {selectedOferta && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{ofertaLabel(selectedOferta)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {ofertaDuration(selectedOferta)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    {ofertaScreens(selectedOferta)} pantalla{ofertaScreens(selectedOferta) !== 1 ? 's' : ''}
                  </span>
                  {selectedOferta.garantia_dias > 0 && (
                    <span className="flex items-center gap-1 text-green-500">
                      <Check className="w-4 h-4" />
                      Garantía {selectedOferta.garantia_dias} días
                    </span>
                  )}
                </div>

                {/* Services included */}
                <div>
                  <p className="font-medium mb-2">Servicios incluidos:</p>
                  <ul className="space-y-1">
                    {selectedOferta.servicios.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {s.name} — {s.pivot.numero_perfiles} perfil{s.pivot.numero_perfiles !== 1 ? 'es' : ''}, {s.pivot.duracion_dias} días
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div>
                  <p className="font-medium mb-2">Características:</p>
                  <ul className="space-y-1">
                    {ofertaFeatures(selectedOferta).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stock */}
                <p className="text-xs text-muted-foreground">
                  Stock disponible: {selectedOferta.stock} unidades
                </p>

                {/* Tipo de venta destacado */}
                <div className={cn(
                  "p-3 rounded-lg border-2",
                  selectedOferta.cuenta_completa
                    ? "border-blue-500/40 bg-blue-500/10"
                    : "border-purple-500/40 bg-purple-500/10"
                )}>
                  <div className="flex items-center gap-2">
                    {selectedOferta.cuenta_completa
                      ? <UsersIcon className="w-5 h-5 text-blue-400" />
                      : <User className="w-5 h-5 text-purple-400" />}
                    <p className={cn("font-semibold", selectedOferta.cuenta_completa ? "text-blue-400" : "text-purple-400")}>
                      {selectedOferta.cuenta_completa ? 'Acceso a la cuenta completa' : 'Acceso a 1 perfil individual'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedOferta.cuenta_completa
                      ? 'Recibirás email + contraseña. Puedes usar todos los perfiles internos.'
                      : 'Cuenta compartida — solo 1 dispositivo conectado. No cambiar nombres, contraseña, PIN ni eliminar perfiles. Incumplir estas reglas: suspensión de 3 días.'}
                  </p>
                </div>

                {/* Stock */}
                <p className="text-xs text-muted-foreground">
                  Stock disponible: {selectedOferta.stock} unidades
                </p>

                {/* Balance */}
                {(() => {
                  const priceInfo = getPriceInfo(selectedOferta)
                  const tieneDescuento = priceInfo.descuento !== null && priceInfo.precioFinal < priceInfo.precioOriginal
                  const finalPrice = priceInfo.precioFinal
                  return (
                    <>
                      {isAuthenticated && user && (
                        <div className={cn(
                          'p-3 rounded-lg border',
                          user.balance >= finalPrice
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        )}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tu saldo:</span>
                            <span className={cn('font-semibold', user.balance >= finalPrice ? 'text-green-500' : 'text-red-500')}>
                              {formatCOP(user.balance)}
                            </span>
                          </div>
                          {user.balance < finalPrice && (
                            <p className="text-xs text-red-500 mt-1">
                              Te faltan {formatCOP(finalPrice - user.balance)} para esta compra
                            </p>
                          )}
                        </div>
                      )}

                      {purchaseError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-sm text-red-500">{purchaseError}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          {tieneDescuento && (
                            <span className="text-sm text-muted-foreground line-through block">
                              {formatCOP(priceInfo.precioOriginal)}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-primary">
                            {formatCOP(finalPrice)}
                          </span>
                          {tieneDescuento && (
                            <Badge className="ml-2 bg-red-500 text-white border-none">
                              <Tag className="w-3 h-3 mr-1" />Ahorras {formatCOP(priceInfo.ahorro)}
                            </Badge>
                          )}
                        </div>
                        <Button
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handlePurchase(selectedOferta)}
                          disabled={isPurchasing || (!!user && user.balance < finalPrice)}
                        >
                          {isPurchasing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
                          ) : (
                            <><ShoppingCart className="w-4 h-4 mr-2" />Comprar ahora</>
                          )}
                        </Button>
                      </div>
                    </>
                  )
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Prompt */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Inicia sesión para comprar</DialogTitle>
            <DialogDescription>
              Necesitas una cuenta para realizar compras.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAuthPrompt(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Success Modal */}
      <PurchaseSuccessModal compra={purchaseSuccess} onClose={() => setPurchaseSuccess(null)} />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

// ─── Purchase Success Modal ───────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={copy} className="ml-2 text-primary hover:text-primary/80 transition-colors flex-shrink-0">
      {copied ? <Check className="w-4 h-4" /> : <span className="text-xs underline">Copiar</span>}
    </button>
  )
}

function PurchaseSuccessModal({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
  if (!compra) return null

  const serviceName = compra.oferta
    ? compra.oferta.servicios.map((s) => s.name).join(' + ')
    : `Oferta #${compra.oferta_id}`

  let creds: DatosAcceso | null = null
  try { if (compra.datos_acceso) creds = JSON.parse(compra.datos_acceso) } catch { /* ignore */ }

  return (
    <Dialog open={!!compra} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <PackageCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl text-primary">¡Compra exitosa!</DialogTitle>
              <DialogDescription>{serviceName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resumen */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio pagado</span>
              <span className="font-semibold text-primary">
                ${compra.precio_compra.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium text-green-500">Aprobada ✓</span>
            </div>
          </div>

          {/* Credenciales */}
          {creds ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Check className="w-4 h-4" /> Tus credenciales de acceso
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <div className="flex items-center font-mono text-foreground">
                    <span>{creds.email}</span>
                    <CopyBtn text={creds.email} />
                  </div>
                </div>
                {creds.tipo === 'cuenta_completa' && creds.password && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contraseña</span>
                    <div className="flex items-center font-mono text-foreground">
                      <span>{creds.password}</span>
                      <CopyBtn text={creds.password} />
                    </div>
                  </div>
                )}
                {creds.tipo === 'perfil' && (
                  <>
                    {creds.perfil_nombre && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Perfil</span>
                        <span className="font-mono text-foreground">{creds.perfil_nombre}</span>
                      </div>
                    )}
                    {creds.perfil_pin && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">PIN</span>
                        <div className="flex items-center font-mono text-foreground">
                          <span>{creds.perfil_pin}</span>
                          <CopyBtn text={creds.perfil_pin} />
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-muted-foreground">Vigencia hasta</span>
                  <span className="text-foreground">
                    {new Date(creds.vigencia_hasta).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-600 dark:text-yellow-400 text-center">
              Las credenciales estarán disponibles en <strong>Mis Cuentas</strong> en breve.
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Puedes ver tus credenciales en cualquier momento en <strong>Mis Cuentas</strong>
          </p>
        </div>

        <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">
          ¡Entendido!
        </Button>
      </DialogContent>
    </Dialog>
  )
}
