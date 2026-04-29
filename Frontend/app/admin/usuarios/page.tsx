"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FadeIn } from "@/components/animations/motion"
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Edit,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const users = [
  {
    id: 1,
    name: "Carlos Martínez",
    email: "carlos@email.com",
    type: "mayor",
    balance: 450.00,
    purchases: 28,
    status: "activo",
    joinDate: "15 Dic 2023",
  },
  {
    id: 2,
    name: "Ana Rodríguez",
    email: "ana@email.com",
    type: "detal",
    balance: 75.50,
    purchases: 5,
    status: "activo",
    joinDate: "02 Ene 2024",
  },
  {
    id: 3,
    name: "Luis Pérez",
    email: "luis@email.com",
    type: "detal",
    balance: 120.00,
    purchases: 12,
    status: "activo",
    joinDate: "28 Nov 2023",
  },
  {
    id: 4,
    name: "María Santos",
    email: "maria@email.com",
    type: "mayor",
    balance: 890.25,
    purchases: 45,
    status: "activo",
    joinDate: "10 Oct 2023",
  },
  {
    id: 5,
    name: "Pedro García",
    email: "pedro@email.com",
    type: "detal",
    balance: 0.00,
    purchases: 2,
    status: "inactivo",
    joinDate: "05 Ene 2024",
  },
  {
    id: 6,
    name: "Laura López",
    email: "laura@email.com",
    type: "mayor",
    balance: 1250.00,
    purchases: 67,
    status: "activo",
    joinDate: "18 Sep 2023",
  },
]

const Loading = () => null;

export default function AdminUsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "detal" | "mayor">("all")
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const searchParams = useSearchParams();

  const filteredUsers = users.filter((user) => {
    if (filterType !== "all" && user.type !== filterType) return false
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Gestión de usuarios
              </h1>
              <p className="text-muted-foreground">
                Administra los usuarios de la plataforma
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Users className="w-4 h-4 mr-2" />
              Nuevo usuario
            </Button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FadeIn delay={0.1}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total usuarios</p>
                    <p className="text-xl font-bold text-foreground">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
          
          <FadeIn delay={0.15}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mayoristas</p>
                    <p className="text-xl font-bold text-foreground">
                      {users.filter((u) => u.type === "mayor").length}
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
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Detallistas</p>
                    <p className="text-xl font-bold text-foreground">
                      {users.filter((u) => u.type === "detal").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Filters */}
        <FadeIn delay={0.25}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  {[
                    { key: "all", label: "Todos" },
                    { key: "detal", label: "Detal" },
                    { key: "mayor", label: "Mayor" },
                  ].map((f) => (
                    <Button
                      key={f.key}
                      variant={filterType === f.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(f.key as typeof filterType)}
                      className={cn(
                        "transition-all duration-200",
                        filterType === f.key
                          ? "bg-primary text-primary-foreground"
                          : "hover:border-primary hover:text-primary"
                      )}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Users Table */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Lista de usuarios</CardTitle>
              <CardDescription>
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Compras</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className={cn(
                          "transition-colors duration-200",
                          hoveredRow === user.id && "bg-secondary/50"
                        )}
                        onMouseEnter={() => setHoveredRow(user.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              user.type === "mayor"
                                ? "text-blue-500 border-blue-500/30 bg-blue-500/10"
                                : "text-green-500 border-green-500/30 bg-green-500/10"
                            )}
                          >
                            {user.type === "mayor" ? "Mayorista" : "Detallista"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${user.balance.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>{user.purchases}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              user.status === "activo"
                                ? "text-green-500 border-green-500/30"
                                : "text-red-500 border-red-500/30"
                            )}
                          >
                            {user.status === "activo" ? (
                              <UserCheck className="w-3 h-3 mr-1" />
                            ) : (
                              <UserX className="w-3 h-3 mr-1" />
                            )}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.joinDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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
      </div>
    </Suspense>
  )
}
