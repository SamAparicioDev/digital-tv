"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  Star,
  Clock,
  Monitor,
  Zap,
  Check,
  Loader2,
  AlertCircle,
  Wallet,
  Eye,
  EyeOff,
  Copy,
  PartyPopper,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/landing/whatsapp-button";
import { useAuth } from "@/contexts/auth-context";
import { api, type Screen } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  duration: string;
  screens: number;
  rating: number;
  features: string[];
  popular: boolean;
}

const products: Product[] = [
  {
    id: "1",
    name: "Netflix Premium",
    description: "Acceso completo a todo el catálogo de Netflix en 4K UHD",
    price: 25000,
    originalPrice: 32000,
    image: "/placeholder.svg?height=200&width=300",
    category: "Netflix",
    duration: "1 mes",
    screens: 1,
    rating: 4.9,
    features: ["4K Ultra HD", "Sin anuncios", "Descargas ilimitadas"],
    popular: true,
  },
  {
    id: "2",
    name: "Disney+ Familiar",
    description: "Disney, Pixar, Marvel, Star Wars y National Geographic",
    price: 20000,
    image: "/placeholder.svg?height=200&width=300",
    category: "Disney+",
    duration: "1 mes",
    screens: 1,
    rating: 4.8,
    features: ["4K Ultra HD", "7 perfiles", "Contenido exclusivo"],
    popular: true,
  },
  {
    id: "3",
    name: "HBO Max Completo",
    description: "Series y películas exclusivas de HBO, Warner y más",
    price: 22000,
    originalPrice: 28000,
    image: "/placeholder.svg?height=200&width=300",
    category: "HBO Max",
    duration: "1 mes",
    screens: 1,
    rating: 4.7,
    features: ["Full HD", "Estrenos de cine", "Series originales"],
    popular: false,
  },
  {
    id: "4",
    name: "Prime Video",
    description: "Películas, series y contenido exclusivo de Amazon",
    price: 18000,
    image: "/placeholder.svg?height=200&width=300",
    category: "Prime Video",
    duration: "1 mes",
    screens: 1,
    rating: 4.6,
    features: ["4K Ultra HD", "X-Ray", "Canales adicionales"],
    popular: false,
  },
  {
    id: "5",
    name: "Spotify Premium",
    description: "Música ilimitada sin anuncios y descarga offline",
    price: 15000,
    image: "/placeholder.svg?height=200&width=300",
    category: "Spotify",
    duration: "1 mes",
    screens: 1,
    rating: 4.9,
    features: ["Sin anuncios", "Calidad alta", "Descargas"],
    popular: true,
  },
  {
    id: "6",
    name: "YouTube Premium",
    description: "YouTube sin anuncios + YouTube Music incluido",
    price: 16000,
    originalPrice: 20000,
    image: "/placeholder.svg?height=200&width=300",
    category: "YouTube",
    duration: "1 mes",
    screens: 1,
    rating: 4.7,
    features: ["Sin anuncios", "YouTube Music", "Descargas"],
    popular: false,
  },
  {
    id: "7",
    name: "Paramount+",
    description: "Estrenos de Paramount, series originales y deportes",
    price: 17000,
    image: "/placeholder.svg?height=200&width=300",
    category: "Paramount+",
    duration: "1 mes",
    screens: 1,
    rating: 4.5,
    features: ["Full HD", "NFL en vivo", "Contenido Paramount"],
    popular: false,
  },
  {
    id: "8",
    name: "Star+",
    description: "Deportes en vivo, series de FX y más contenido adulto",
    price: 19000,
    image: "/placeholder.svg?height=200&width=300",
    category: "Star+",
    duration: "1 mes",
    screens: 1,
    rating: 4.6,
    features: ["ESPN en vivo", "Series FX", "Full HD"],
    popular: false,
  },
];

const categories = [
  "Todos",
  "Netflix",
  "Disney+",
  "HBO Max",
  "Prime Video",
  "Spotify",
  "YouTube",
  "Paramount+",
  "Star+",
];

const Loading = () => null;

export default function StorePage() {
  const { user, isAuthenticated, updateBalance } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Purchase states
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<Screen | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return b.popular ? 1 : -1;
      }
    });

  const handlePurchase = async (product: Product) => {
    console.log("[v0] handlePurchase called", { isAuthenticated, user, product });
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!user || user.balance < product.price) {
      console.log("[v0] Saldo insuficiente", { userBalance: user?.balance, productPrice: product.price });
      setPurchaseError("Saldo insuficiente. Por favor recarga tu saldo primero.");
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      console.log("[v0] Calling api.purchaseScreen...");
      const result = await api.purchaseScreen({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        duration: product.duration,
      });

      console.log("[v0] Purchase result:", result);
      updateBalance(result.newBalance);
      setPurchaseSuccess(result.screen);
      setSelectedProduct(null);
    } catch (error) {
      console.log("[v0] Purchase error:", error);
      setPurchaseError(error instanceof Error ? error.message : "Error al procesar la compra");
    } finally {
      setIsPurchasing(false);
    }
  };

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
                Encuentra las mejores cuentas de streaming al mejor precio
              </p>
              {isAuthenticated && user && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Tu saldo: </span>
                  <span className="font-bold text-primary">${user.balance.toLocaleString("es-CO")}</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 items-center w-full md:w-auto justify-end">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Más populares</SelectItem>
                    <SelectItem value="price-low">Menor precio</SelectItem>
                    <SelectItem value="price-high">Mayor precio</SelectItem>
                    <SelectItem value="rating">Mejor valorados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {filteredProducts.length} productos encontrados
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="bg-card border-border overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {product.popular && (
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                            <Zap className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {product.originalPrice && (
                          <Badge className="absolute top-3 right-3 bg-red-500 text-foreground">
                            -
                            {Math.round(
                              (1 - product.price / product.originalPrice) * 100
                            )}
                            %
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            {product.rating}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {product.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Monitor className="w-4 h-4" />
                            {product.screens} pantalla
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary">
                              ${product.price.toLocaleString("es-CO")}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${product.originalPrice.toLocaleString("es-CO")}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(product);
                            }}
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
          </div>
        </section>
      </main>

      {/* Product Modal */}
      <Suspense fallback={<Loading />}>
        <Dialog
          open={!!selectedProduct}
          onOpenChange={() => {
            setSelectedProduct(null);
            setPurchaseError(null);
          }}
        >
          <DialogContent className="bg-card border-border max-w-lg">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={selectedProduct.image || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    {selectedProduct.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      {selectedProduct.rating} valoración
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {selectedProduct.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      {selectedProduct.screens} pantalla
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Características:</p>
                    <ul className="space-y-1">
                      {selectedProduct.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Balance info */}
                  {isAuthenticated && user && (
                    <div className={cn(
                      "p-3 rounded-lg border",
                      user.balance >= selectedProduct.price 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-red-500/10 border-red-500/30"
                    )}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tu saldo:</span>
                        <span className={cn(
                          "font-semibold",
                          user.balance >= selectedProduct.price ? "text-green-500" : "text-red-500"
                        )}>
                          ${user.balance.toLocaleString("es-CO")}
                        </span>
                      </div>
                      {user.balance < selectedProduct.price && (
                        <p className="text-xs text-red-500 mt-1">
                          Te faltan ${(selectedProduct.price - user.balance).toLocaleString("es-CO")} para esta compra
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error message */}
                  {purchaseError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-500">{purchaseError}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        ${selectedProduct.price.toLocaleString("es-CO")}
                      </span>
                      {selectedProduct.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${selectedProduct.originalPrice.toLocaleString("es-CO")}
                        </span>
                      )}
                    </div>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handlePurchase(selectedProduct)}
                      disabled={isPurchasing || (isAuthenticated && user && user.balance < selectedProduct.price)}
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar ahora
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Suspense>

      {/* Auth Prompt Modal */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Inicia sesión para comprar</DialogTitle>
            <DialogDescription>
              Necesitas una cuenta para realizar compras y gestionar tus pantallas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowAuthPrompt(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground"
              onClick={() => {
                setShowAuthPrompt(false);
                // The auth modal can be triggered from the header
              }}
            >
              Ir a iniciar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Success Modal */}
      <PurchaseSuccessModal
        screen={purchaseSuccess}
        onClose={() => setPurchaseSuccess(null)}
      />

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

// Purchase Success Modal Component
function PurchaseSuccessModal({ screen, onClose }: { screen: Screen | null; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!screen) return null;

  return (
    <Dialog open={!!screen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <PartyPopper className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-green-500">Compra exitosa</DialogTitle>
              <DialogDescription>
                Tu pantalla de {screen.platform} está lista
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-foreground font-mono">{screen.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(screen.email, "email")}
              >
                {copied === "email" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Contraseña</p>
                <p className="text-foreground font-mono">
                  {showPassword ? screen.password : "••••••••"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(screen.password, "password")}
                >
                  {copied === "password" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Profile & PIN */}
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Perfil</p>
                <p className="text-foreground">{screen.profile}</p>
              </div>
              {screen.pin && (
                <div>
                  <p className="text-xs text-muted-foreground">PIN</p>
                  <p className="text-foreground font-mono">{screen.pin}</p>
                </div>
              )}
            </div>

            {/* Expiry */}
            <div>
              <p className="text-xs text-muted-foreground">Expira</p>
              <p className="text-foreground">
                {new Date(screen.expiry).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Puedes ver tus pantallas en cualquier momento desde tu perfil
          </p>
        </div>

        <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
