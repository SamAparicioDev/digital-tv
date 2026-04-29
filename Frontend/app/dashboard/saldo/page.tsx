"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FadeIn, CountUp } from "@/components/animations/motion"
import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  QrCode,
  Plus,
  Check,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

const rechargeAmounts = [10, 25, 50, 100, 200]

const paymentMethods = [
  { id: "card", name: "Tarjeta de crédito", icon: CreditCard },
  { id: "transfer", name: "Transferencia", icon: Banknote },
  { id: "qr", name: "Pago QR", icon: QrCode },
]

const rechargeHistory = [
  { id: 1, amount: 50.00, date: "15 Ene 2024", status: "completado", method: "Tarjeta" },
  { id: 2, amount: 25.00, date: "10 Ene 2024", status: "completado", method: "Transferencia" },
  { id: 3, amount: 100.00, date: "05 Ene 2024", status: "completado", method: "Tarjeta" },
  { id: 4, amount: 30.00, date: "01 Ene 2024", status: "pendiente", method: "Transferencia" },
]

export default function SaldoPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const finalAmount = selectedAmount || (customAmount ? Number.parseFloat(customAmount) : 0)

  const handleRecharge = async () => {
    if (!finalAmount || !selectedMethod) return
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setShowSuccess(true)
    
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedAmount(null)
      setCustomAmount("")
      setSelectedMethod(null)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Gestión de saldo
          </h1>
          <p className="text-muted-foreground">
            Recarga tu saldo para realizar compras
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Balance Card */}
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
                    $<CountUp end={150} duration={1.5} />.00
                  </p>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Recharge Form */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recargar saldo</CardTitle>
              <CardDescription>Selecciona el monto y método de pago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div className="space-y-3">
                <Label>Selecciona un monto</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {rechargeAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount("")
                      }}
                      className={cn(
                        "transition-all duration-200",
                        selectedAmount === amount
                          ? "bg-primary text-primary-foreground"
                          : "hover:border-primary hover:text-primary"
                      )}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="customAmount">O ingresa un monto personalizado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    className="pl-8"
                    min="1"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Método de pago</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                        selectedMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <method.icon className={cn(
                        "w-5 h-5",
                        selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        selectedMethod === method.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary & Submit */}
              {finalAmount > 0 && selectedMethod && (
                <FadeIn>
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monto a recargar</span>
                      <span className="font-medium">${finalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Comisión</span>
                      <span className="font-medium text-green-500">$0.00</span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary">${finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </FadeIn>
              )}

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                disabled={!finalAmount || !selectedMethod || isLoading}
                onClick={handleRecharge}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </span>
                ) : showSuccess ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    ¡Recarga exitosa!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Recargar ${finalAmount.toFixed(2)}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Recharge History */}
      <FadeIn delay={0.3}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Historial de recargas</CardTitle>
            <CardDescription>Tus recargas recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rechargeHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      item.status === "completado" ? "bg-green-500/10" : "bg-yellow-500/10"
                    )}>
                      {item.status === "completado" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">+${item.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{item.method} • {item.date}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      item.status === "completado"
                        ? "text-green-500 border-green-500/30"
                        : "text-yellow-500 border-yellow-500/30"
                    )}
                  >
                    {item.status === "completado" ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
