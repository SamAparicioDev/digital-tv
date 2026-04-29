"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, CountUp } from "@/components/animations/motion"
import { 
  Wallet, 
  Clock, 
  Check, 
  X,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type User } from "@/lib/api"

interface RechargeRequest {
  id: number
  user: string
  email: string
  amount: number
  method: string
  reference: string
  date: string
  status: "pendiente" | "aprobado" | "rechazado"
}

const initialRechargeRequests: RechargeRequest[] = [
  {
    id: 1,
    user: "Carlos Martínez",
    email: "carlos@email.com",
    amount: 100000,
    method: "Transferencia",
    reference: "TRF-2024-001234",
    date: "18 Ene 2024 14:32",
    status: "pendiente",
  },
  {
    id: 2,
    user: "Ana Rodríguez",
    email: "ana@email.com",
    amount: 50000,
    method: "Nequi",
    reference: "NEQ-2024-005678",
    date: "18 Ene 2024 12:15",
    status: "pendiente",
  },
  {
    id: 3,
    user: "Luis Pérez",
    email: "luis@email.com",
    amount: 200000,
    method: "Transferencia",
    reference: "TRF-2024-001233",
    date: "17 Ene 2024 18:45",
    status: "aprobado",
  },
  {
    id: 4,
    user: "María Santos",
    email: "maria@email.com",
    amount: 75000,
    method: "Daviplata",
    reference: "DAV-2024-009876",
    date: "17 Ene 2024 11:20",
    status: "aprobado",
  },
  {
    id: 5,
    user: "Pedro García",
    email: "pedro@email.com",
    amount: 30000,
    method: "Transferencia",
    reference: "TRF-2024-001230",
    date: "16 Ene 2024 16:08",
    status: "rechazado",
  },
]

export default function AdminSaldoPage() {
  const [requests, setRequests] = useState<RechargeRequest[]>(initialRechargeRequests)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("solicitudes")
  
  // Add balance states
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [searchUser, setSearchUser] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [addBalanceOpen, setAddBalanceOpen] = useState(false)
  const [addAmount, setAddAmount] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [isAddingBalance, setIsAddingBalance] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  // Load users
  useEffect(() => {
    if (activeTab === "agregar") {
      loadUsers()
    }
  }, [activeTab])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleApprove = async (id: number) => {
    setProcessingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "aprobado" } : r))
    )
    setProcessingId(null)
  }

  const handleReject = async (id: number) => {
    setProcessingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rechazado" } : r))
    )
    setProcessingId(null)
  }

  const handleAddBalance = async () => {
    if (!selectedUser || !addAmount) return

    setIsAddingBalance(true)
    try {
      await api.addUserBalance(
        selectedUser.id,
        parseFloat(addAmount),
        addDescription || `Saldo agregado por administrador`
      )
      
      // Update local user list
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, balance: u.balance + parseFloat(addAmount) }
          : u
      ))
      
      setAddSuccess(true)
      setTimeout(() => {
        setAddSuccess(false)
        setAddBalanceOpen(false)
        setSelectedUser(null)
        setAddAmount("")
        setAddDescription("")
      }, 2000)
    } catch (error) {
      console.error("Error adding balance:", error)
    } finally {
      setIsAddingBalance(false)
    }
  }

  const pendingTotal = requests
    .filter((r) => r.status === "pendiente")
    .reduce((sum, r) => sum + r.amount, 0)

  const approvedTotal = requests
    .filter((r) => r.status === "aprobado")
    .reduce((sum, r) => sum + r.amount, 0)

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Gestión de Saldo
          </h1>
          <p className="text-muted-foreground">
            Administra las solicitudes de recarga y agrega saldo a usuarios
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FadeIn delay={0.1}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-xl font-bold text-foreground">
                    {requests.filter((r) => r.status === "pendiente").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        <FadeIn delay={0.15}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto pendiente</p>
                  <p className="text-xl font-bold text-foreground">
                    $<CountUp end={pendingTotal} duration={1.5} separator="," />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aprobado hoy</p>
                  <p className="text-xl font-bold text-foreground">
                    $<CountUp end={approvedTotal} duration={1.5} separator="," />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Tabs */}
      <FadeIn delay={0.25}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="solicitudes">
              <Clock className="w-4 h-4 mr-2" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="agregar">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Saldo
            </TabsTrigger>
          </TabsList>

          {/* Solicitudes Tab */}
          <TabsContent value="solicitudes" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Solicitudes de recarga</CardTitle>
                <CardDescription>
                  Revisa y procesa las solicitudes de recarga pendientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request, index) => (
                    <div
                      key={request.id}
                      className={cn(
                        "flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border transition-all duration-300",
                        request.status === "pendiente"
                          ? "border-yellow-500/30 bg-yellow-500/5"
                          : request.status === "aprobado"
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-red-500/30 bg-red-500/5"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4 mb-4 lg:mb-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">{request.user}</p>
                            <Badge
                              variant="outline"
                              className={cn(
                                request.status === "pendiente"
                                  ? "text-yellow-500 border-yellow-500/30 animate-pulse"
                                  : request.status === "aprobado"
                                  ? "text-green-500 border-green-500/30"
                                  : "text-red-500 border-red-500/30"
                              )}
                            >
                              {request.status === "pendiente" && <Clock className="w-3 h-3 mr-1" />}
                              {request.status === "aprobado" && <Check className="w-3 h-3 mr-1" />}
                              {request.status === "rechazado" && <X className="w-3 h-3 mr-1" />}
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              {request.method}
                            </span>
                            <span>•</span>
                            <span>{request.reference}</span>
                            <span>•</span>
                            <span>{request.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ${request.amount.toLocaleString("es-CO")}
                          </p>
                        </div>

                        {request.status === "pendiente" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleApprove(request.id)}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprobar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                              onClick={() => handleReject(request.id)}
                              disabled={processingId === request.id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agregar Saldo Tab */}
          <TabsContent value="agregar" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Agregar Saldo a Usuario
                </CardTitle>
                <CardDescription>
                  Selecciona un usuario y agrega saldo manualmente a su cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario por nombre o email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Users List */}
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Saldo actual</p>
                            <p className="font-semibold text-primary">
                              ${user.balance.toLocaleString("es-CO")}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground"
                            onClick={() => {
                              setSelectedUser(user)
                              setAddBalanceOpen(true)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    ))}

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron usuarios</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Add Balance Dialog */}
      <Dialog open={addBalanceOpen} onOpenChange={(open) => {
        if (!open) {
          setAddBalanceOpen(false)
          setSelectedUser(null)
          setAddAmount("")
          setAddDescription("")
          setAddSuccess(false)
        }
      }}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          {addSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <DialogTitle className="text-green-500 mb-2">Saldo Agregado</DialogTitle>
              <DialogDescription>
                Se agregaron ${parseFloat(addAmount).toLocaleString("es-CO")} a {selectedUser?.name}
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Agregar Saldo</DialogTitle>
                <DialogDescription>
                  Agrega saldo a la cuenta de {selectedUser?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* User Info */}
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {selectedUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedUser?.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Saldo actual:</span>
                      <span className="font-semibold text-primary">
                        ${selectedUser?.balance.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label>Monto a agregar</Label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[10000, 25000, 50000, 100000].map((preset) => (
                      <Button
                        key={preset}
                        variant={addAmount === String(preset) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAddAmount(String(preset))}
                        className={cn(
                          "text-xs",
                          addAmount === String(preset) && "bg-primary text-primary-foreground"
                        )}
                      >
                        ${(preset / 1000)}k
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="Otro monto"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Descripción (opcional)</Label>
                  <Textarea
                    placeholder="Ej: Bonificación por referido, Corrección de saldo, etc."
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* New Balance Preview */}
                {addAmount && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nuevo saldo:</span>
                      <span className="font-bold text-green-500">
                        ${((selectedUser?.balance || 0) + parseFloat(addAmount || "0")).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setAddBalanceOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={handleAddBalance}
                  disabled={!addAmount || parseFloat(addAmount) <= 0 || isAddingBalance}
                >
                  {isAddingBalance ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Saldo
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
