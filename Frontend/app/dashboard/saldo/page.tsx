"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/motion"
import {
  Wallet, Plus, Check, Clock, AlertCircle, Loader2, RefreshCw, Copy, Upload, X, ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type Transaccion, type MetodoPago } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

const RECHARGE_AMOUNTS = [10000, 25000, 50000, 100000, 200000]

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

export default function SaldoPage() {
  const { user, refreshUser } = useAuth()

  // Datos de la API
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [isLoadingMetodos, setIsLoadingMetodos] = useState(true)

  // Formulario
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [referencia, setReferencia] = useState('')
  const [copied, setCopied] = useState(false)

  // Estado del submit
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [createdTxId, setCreatedTxId] = useState<number | null>(null)

  // Comprobante (imagen opcional)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)
  const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)
  const [comprobanteUploaded, setComprobanteUploaded] = useState(false)

  // Historial
  const [historial, setHistorial] = useState<Transaccion[]>([])
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(true)

  const finalAmount = selectedAmount ?? (customAmount ? Number.parseFloat(customAmount) : 0)
  const primaryCuenta = selectedMetodo?.numero_cuentas?.[0]
  const canSubmit = selectedMetodo && finalAmount >= 1000 && referencia.trim().length > 0

  useEffect(() => {
    const init = async () => {
      setIsLoadingMetodos(true)
      try {
        const data = await api.getMetodosPago()
        setMetodos(data)
      } catch {
        // silencioso — el usuario verá campo vacío
      } finally {
        setIsLoadingMetodos(false)
      }
    }
    init()
    loadHistorial()
  }, [])

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    if (!canSubmit || !selectedMetodo) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.createRecarga(finalAmount, selectedMetodo.id, referencia.trim())
      setCreatedTxId(result.transaccion.id)
      await refreshUser()
      await loadHistorial()
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobanteFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setComprobantePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleUploadComprobante = async () => {
    if (!comprobanteFile || !createdTxId) return
    setIsUploadingComprobante(true)
    try {
      await api.uploadComprobante(createdTxId, comprobanteFile)
      setComprobanteUploaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el comprobante')
    } finally {
      setIsUploadingComprobante(false)
    }
  }

  const handleReset = () => {
    setStep('form')
    setSelectedMetodo(null)
    setSelectedAmount(null)
    setCustomAmount('')
    setReferencia('')
    setError(null)
    setCreatedTxId(null)
    setComprobanteFile(null)
    setComprobantePreview(null)
    setComprobanteUploaded(false)
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
                <Check className="w-3 h-3 mr-1" /> Verificado
              </Badge>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Formulario */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Solicitar recarga</CardTitle>
              <CardDescription>
                {step === 'form'
                  ? 'Selecciona el método de pago, ingresa el monto y la referencia del comprobante'
                  : '¡Solicitud enviada exitosamente!'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 'success' ? (
                /* ── SUCCESS + UPLOAD COMPROBANTE ─────────────────── */
                <div className="space-y-5 py-2">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">¡Solicitud enviada!</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Adjunta tu soporte de pago para agilizar la aprobación y entrega de credenciales.
                    </p>
                  </div>

                  {/* Upload comprobante */}
                  {comprobanteUploaded ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-500">Comprobante enviado</p>
                        <p className="text-xs text-muted-foreground">El administrador revisará tu pago</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">
                        Adjuntar comprobante de pago <span className="text-muted-foreground font-normal">(opcional)</span>
                      </Label>

                      {comprobantePreview ? (
                        <div className="relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={comprobantePreview}
                            alt="Comprobante"
                            className="w-full max-h-48 object-contain rounded-lg border border-border bg-secondary/30"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => { setComprobanteFile(null); setComprobantePreview(null) }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{comprobanteFile?.name}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer"
                        >
                          <ImageIcon className="w-7 h-7 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Haz clic para adjuntar el comprobante
                          </span>
                          <span className="text-xs text-muted-foreground">JPG, PNG, WebP, PDF — máx. 5 MB</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={handleComprobanteChange}
                      />

                      {comprobanteFile && (
                        <Button
                          className="w-full bg-primary text-primary-foreground"
                          onClick={handleUploadComprobante}
                          disabled={isUploadingComprobante}
                        >
                          {isUploadingComprobante
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo...</>
                            : <><Upload className="w-4 h-4 mr-2" />Enviar comprobante</>}
                        </Button>
                      )}

                      {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-sm text-red-500">{error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground">
                    Hacer otra recarga
                  </Button>
                </div>
              ) : (
                /* ── FORM ────────────────────────────────────────── */
                <div className="space-y-6">

                  {/* 1. Método de pago */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      1. Selecciona el método de pago
                    </Label>

                    {isLoadingMetodos ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando métodos...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {metodos.map((m) => {
                          const cuenta = m.numero_cuentas?.[0]
                          const isSelected = selectedMetodo?.id === m.id
                          return (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMetodo(m)}
                              className={cn(
                                'flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200',
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{m.emoji}</span>
                                  <span className="font-semibold text-foreground">{m.nombre}</span>
                                </div>
                                <div className={cn(
                                  'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                )}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                </div>
                              </div>
                              {cuenta && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {cuenta.descripcion ?? 'Número'}
                                  </p>
                                  <p className="text-sm font-bold tracking-wider text-foreground">
                                    {cuenta.numero}
                                  </p>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Cuenta seleccionada con botón copiar */}
                  {selectedMetodo && primaryCuenta && (
                    <div
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ borderColor: selectedMetodo.color ?? undefined, backgroundColor: `${selectedMetodo.color}15` }}
                    >
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Transfiere a este número {selectedMetodo.emoji}
                        </p>
                        <p className="font-bold text-lg tracking-widest">{primaryCuenta.numero}</p>
                        {primaryCuenta.descripcion && (
                          <p className="text-xs text-muted-foreground">{primaryCuenta.descripcion}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(primaryCuenta.numero)}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}

                  {/* Aviso importante */}
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ <strong>No colocar nada en la descripción del pago.</strong> Los pedidos se entregan en orden de pago, según la afluencia de clientes.
                  </div>

                  {/* 2. Monto */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">2. Monto a recargar (COP)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {RECHARGE_AMOUNTS.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount ? 'default' : 'outline'}
                          onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
                          className={cn(
                            'text-xs',
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
                        placeholder="Otro monto (mín. $1.000)"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                        className="pl-8"
                        min="1000"
                      />
                    </div>
                  </div>

                  {/* 3. Referencia del pago */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      3. Referencia / número de comprobante <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Ej: 123456789, TXN-2024-001..."
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa el número de transacción o comprobante de tu transferencia.
                    </p>
                  </div>

                  {/* Resumen */}
                  {finalAmount >= 1000 && selectedMetodo && (
                    <div className="p-4 rounded-lg bg-secondary/50 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Método</span>
                        <span className="font-medium">{selectedMetodo.emoji} {selectedMetodo.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cuenta destino</span>
                        <span className="font-medium font-mono">{primaryCuenta?.numero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monto</span>
                        <span className="font-medium">${finalAmount.toLocaleString('es-CO')}</span>
                      </div>
                      {referencia && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Referencia</span>
                          <span className="font-medium font-mono text-xs">{referencia}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!canSubmit || isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" />
                        Solicitar recarga
                        {finalAmount >= 1000 ? ` · $${finalAmount.toLocaleString('es-CO')}` : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Historial */}
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
                        t.estado === 'RECHAZADO' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                      )}>
                        <Clock className={cn(
                          'w-4 h-4',
                          t.estado === 'APROBADO' ? 'text-green-500' :
                          t.estado === 'RECHAZADO' ? 'text-red-500' : 'text-yellow-500'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          +${t.monto.toLocaleString('es-CO')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.metodo_pago?.nombre ?? 'Recarga'}
                          {t.referencia_pago ? ` · Ref: ${t.referencia_pago}` : ''}
                          {' · '}{new Date(t.created_at).toLocaleDateString('es-CO')}
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
