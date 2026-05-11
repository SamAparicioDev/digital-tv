"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import {
  Wallet,
  Plus,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Upload,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Transaccion } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

// ─── Strategy Pattern: métodos de pago ───────────────────────────────────────

interface PaymentMethod {
  id: string
  name: string
  emoji: string
  accountLabel: string
  accountValue: string
  color: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'nequi',
    name: 'Nequi',
    emoji: '💜',
    accountLabel: 'Número Nequi',
    accountValue: '3217390751',
    color: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  },
  {
    id: 'bancolombia',
    name: 'Bancolombia',
    emoji: '💛',
    accountLabel: 'Llave Bancolombia',
    accountValue: '3217390751',
    color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
  },
  {
    id: 'daviplata',
    name: 'Daviplata',
    emoji: '🔴',
    accountLabel: 'Número Daviplata',
    accountValue: '3217390751',
    color: 'border-red-500/50 bg-red-500/10 text-red-400',
  },
]

const RECHARGE_AMOUNTS = [10000, 25000, 50000, 100000, 200000]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(estado: Transaccion['estado']) {
  if (estado === 'APROBADO') return 'text-green-500 border-green-500/30'
  if (estado === 'RECHAZADO') return 'text-red-500 border-red-500/30'
  return 'text-yellow-500 border-yellow-500/30'
}

function statusLabel(estado: Transaccion['estado']) {
  if (estado === 'APROBADO') return 'Aprobada'
  if (estado === 'RECHAZADO') return 'Rechazada'
  return 'Pendiente'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SaldoPage() {
  const { user, refreshUser } = useAuth()

  // Step flow: 'method' → 'amount' → 'success'
  const [step, setStep] = useState<'method' | 'amount' | 'success'>('method')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [copied, setCopied] = useState(false)

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [historial, setHistorial] = useState<Transaccion[]>([])
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(true)

  const finalAmount = selectedAmount ?? (customAmount ? Number.parseFloat(customAmount) : 0)

  const loadHistorial = async () => {
    setIsLoadingHistorial(true)
    try {
      const data = await api.getRecargas()
      setHistorial(data.transacciones.filter((t) => t.tipo === 'deposit'))
    } catch {
      // silencioso
    } finally {
      setIsLoadingHistorial(false)
    }
  }

  useEffect(() => { loadHistorial() }, [])

  const handleCopy = () => {
    if (!selectedMethod) return
    navigator.clipboard.writeText(selectedMethod.accountValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setProofPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0 || !selectedMethod) return
    setIsLoading(true)
    setError(null)
    try {
      await api.createRecarga(finalAmount, selectedMethod.name, selectedMethod.id)
      await refreshUser()
      await loadHistorial()
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStep('method')
    setSelectedMethod(null)
    setSelectedAmount(null)
    setCustomAmount('')
    setProofFile(null)
    setProofPreview(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de saldo</h1>
          <p className="text-muted-foreground">Solicita una recarga de saldo para realizar compras</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saldo actual */}
        <FadeIn delay={0.1}>
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo actual</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${(user?.balance ?? 0).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Check className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Formulario multi-step */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Solicitar recarga</CardTitle>
              <CardDescription>
                {step === 'method' && 'Selecciona tu método de pago'}
                {step === 'amount' && `Transfiere el monto vía ${selectedMethod?.name}`}
                {step === 'success' && '¡Solicitud enviada!'}
              </CardDescription>
            </CardHeader>
            <CardContent>

              {/* ── STEP 1: Selección de método ─────────────────────────── */}
              {step === 'method' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Elige el método con el que realizarás la transferencia:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => { setSelectedMethod(method); setStep('amount') }}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                          'hover:border-primary/60 hover:bg-primary/5',
                          'border-border'
                        )}
                      >
                        <span className="text-3xl">{method.emoji}</span>
                        <span className="font-semibold text-foreground">{method.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Monto + soporte ─────────────────────────────── */}
              {step === 'amount' && selectedMethod && (
                <div className="space-y-5">
                  {/* Datos de la cuenta (strategy) */}
                  <div className={cn('p-4 rounded-xl border-2', selectedMethod.color)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium opacity-70 mb-1">{selectedMethod.accountLabel}</p>
                        <p className="text-2xl font-bold tracking-widest">{selectedMethod.accountValue}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-10 w-10"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs mt-2 opacity-60">
                      Realiza la transferencia a este número y luego completa el formulario
                    </p>
                  </div>

                  {/* Montos predefinidos */}
                  <div className="space-y-2">
                    <Label>Monto a recargar (COP)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {RECHARGE_AMOUNTS.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount ? 'default' : 'outline'}
                          onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
                          className={cn(
                            'text-xs transition-all duration-200',
                            selectedAmount === amount
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:border-primary hover:text-primary'
                          )}
                        >
                          ${amount / 1000}k
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="Otro monto"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                        className="pl-8"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Adjuntar soporte */}
                  <div className="space-y-2">
                    <Label>Soporte de pago (opcional pero recomendado)</Label>
                    {proofPreview ? (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proofPreview}
                          alt="Soporte de pago"
                          className="w-full max-h-48 object-contain rounded-lg border border-border bg-secondary/30"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { setProofFile(null); setProofPreview(null) }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{proofFile?.name}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Haz clic para adjuntar el comprobante de pago
                        </span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, PDF</span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Resumen */}
                  {finalAmount > 0 && (
                    <div className="p-4 rounded-lg bg-secondary/50 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Método</span>
                        <span className="font-medium">{selectedMethod.name} {selectedMethod.emoji}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monto</span>
                        <span className="font-medium">${finalAmount.toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado inicial</span>
                        <span className="text-yellow-500 font-medium">Pendiente de aprobación</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={handleReset}
                    >
                      Cambiar método
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!finalAmount || finalAmount <= 0 || isLoading}
                      onClick={handleSubmit}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Solicitar ${finalAmount > 0 ? finalAmount.toLocaleString('es-CO') : '0'}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Éxito ───────────────────────────────────────── */}
              {step === 'success' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">¡Solicitud enviada!</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Perfecto, por favor adjunta tu soporte de pago en el siguiente link para una mayor
                      agilidad del proceso y entrega de credenciales.
                    </p>
                  </div>

                  <a
                    href="https://wa.me/573217390751?text=Hola%2C+adjunto+mi+soporte+de+pago+para+agilizar+mi+recarga."
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                      'bg-green-500 hover:bg-green-600 text-white font-semibold',
                      'transition-all duration-200 shadow-lg hover:shadow-green-500/30'
                    )}
                  >
                    <span>📎</span>
                    Adjuntar soporte de pago
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="mt-2 text-muted-foreground"
                  >
                    Hacer otra recarga
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Historial de recargas */}
      <FadeIn delay={0.3}>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Historial de recargas</CardTitle>
              <CardDescription>Tus solicitudes de recarga enviadas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={loadHistorial} disabled={isLoadingHistorial}>
              <RefreshCw className={cn("w-4 h-4", isLoadingHistorial && "animate-spin")} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingHistorial ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : historial.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay recargas registradas.</p>
            ) : (
              <div className="space-y-3">
                {historial.map((t, index) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        t.estado === 'APROBADO' ? 'bg-green-500/10' :
                        t.estado === 'RECHAZADO' ? 'bg-red-500/10' :
                        'bg-yellow-500/10'
                      )}>
                        <Clock className={cn(
                          'w-4 h-4',
                          t.estado === 'APROBADO' ? 'text-green-500' :
                          t.estado === 'RECHAZADO' ? 'text-red-500' :
                          'text-yellow-500'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          +${t.monto.toLocaleString('es-CO')}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {t.descripcion} • {new Date(t.created_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusColor(t.estado)}>
                      {statusLabel(t.estado)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
