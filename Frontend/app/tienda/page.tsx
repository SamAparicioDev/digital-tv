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
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/landing/whatsapp-button";
import { useAuth } from "@/contexts/auth-context";
import { api, type Oferta, type Compra } from "@/lib/api";
import { cn } from "@/lib/utils";

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
  return oferta.servicios[0]?.pivot?.numero_perfiles ?? 1
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
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [ofertas, setOfertas] = useState<Oferta[]>([]);
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

  // Load real offers from backend
  useEffect(() => {
    if (!isAuthenticated) { setIsLoadingOfertas(false); return }
    setIsLoadingOfertas(true)
    api.getOfertas()
      .then((data) => { setOfertas(data.filter((o) => o.is_active && o.stock > 0)) })
      .catch((err) => { setLoadError(err.message ?? 'Error cargando ofertas') })
      .finally(() => setIsLoadingOfertas(false))
  }, [isAuthenticated])

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
      switch (sortBy) {
        case 'price-low': return a.precio - b.precio
        case 'price-high': return b.precio - a.precio
        default: return b.stock - a.stock
      }
    })

  const handlePurchase = async (oferta: Oferta) => {
    if (!isAuthenticated) { setShowAuthPrompt(true); return }
    if (!user || user.balance < oferta.precio) {
      setPurchaseError('Saldo insuficiente. Por favor recarga tu saldo primero.')
      return
    }
    setIsPurchasing(true)
    setPurchaseError(null)
    try {
      const result = await api.createCompra(oferta.id)
      await refreshUser()             // actualiza saldo en contexto
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
      <Header />

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
                    ${user.balance.toLocaleString('es-CO')}
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
                    {filteredOfertas.map((oferta, index) => (
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
                            {oferta.cuenta_completa && (
                              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                                <Zap className="w-3 h-3 mr-1" />
                                Cuenta completa
                              </Badge>
                            )}
                            {oferta.stock <= 5 && (
                              <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                                ¡Últimas!
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
                                <Monitor className="w-4 h-4" />
                                {ofertaScreens(oferta)} pantalla{ofertaScreens(oferta) !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">
                                ${oferta.precio.toLocaleString('es-CO')}
                              </span>
                              <Button
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={(e) => { e.stopPropagation(); handlePurchase(oferta) }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
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

                {/* Balance */}
                {isAuthenticated && user && (
                  <div className={cn(
                    'p-3 rounded-lg border',
                    user.balance >= selectedOferta.precio
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  )}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tu saldo:</span>
                      <span className={cn('font-semibold', user.balance >= selectedOferta.precio ? 'text-green-500' : 'text-red-500')}>
                        ${user.balance.toLocaleString('es-CO')}
                      </span>
                    </div>
                    {user.balance < selectedOferta.precio && (
                      <p className="text-xs text-red-500 mt-1">
                        Te faltan ${(selectedOferta.precio - user.balance).toLocaleString('es-CO')} para esta compra
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
                  <span className="text-2xl font-bold text-primary">
                    ${selectedOferta.precio.toLocaleString('es-CO')}
                  </span>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handlePurchase(selectedOferta)}
                    disabled={isPurchasing || (!!user && user.balance < selectedOferta.precio)}
                  >
                    {isPurchasing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4 mr-2" />Comprar ahora</>
                    )}
                  </Button>
                </div>
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

function PurchaseSuccessModal({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
  if (!compra) return null

  const serviceName = compra.oferta
    ? compra.oferta.servicios.map((s) => s.name).join(' + ')
    : `Oferta #${compra.oferta_id}`

  return (
    <Dialog open={!!compra} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-primary">Compra solicitada</DialogTitle>
              <DialogDescription>{serviceName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-secondary/50 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referencia</span>
              <span className="font-mono">#{compra.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio pagado</span>
              <span className="font-semibold text-primary">
                ${compra.precio_compra.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="capitalize font-medium text-yellow-500">{compra.estado}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Tu compra está <strong>pendiente de aprobación</strong> por un administrador.
            Recibirás los accesos una vez sea aprobada.
          </p>
        </div>

        <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  )
}
