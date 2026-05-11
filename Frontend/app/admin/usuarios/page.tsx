"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FadeIn } from "@/components/animations/motion"
import { Users, Search, Wallet, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { api, type WalletWithUser } from "@/lib/api"

export default function AdminUsuariosPage() {
  const [wallets, setWallets] = useState<WalletWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getWallets()
      setWallets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = wallets.filter((w) =>
    w.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSaldo = wallets.reduce((sum, w) => sum + w.saldo, 0)
  const conSaldo = wallets.filter((w) => w.saldo > 0).length

  return (
    <Suspense>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de usuarios</h1>
              <p className="text-muted-foreground">Usuarios registrados en la plataforma</p>
            </div>
            <Button variant="outline" className="bg-transparent" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
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
                    <p className="text-xl font-bold text-foreground">{wallets.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={0.15}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Wallet className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Con saldo</p>
                    <p className="text-xl font-bold text-foreground">{conSaldo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Wallet className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo total circulante</p>
                    <p className="text-xl font-bold text-foreground">${totalSaldo.toLocaleString('es-CO')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Search */}
        <FadeIn delay={0.25}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.3}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Lista de usuarios</CardTitle>
              <CardDescription>
                Mostrando {filtered.length} de {wallets.length} usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={load}>Reintentar</Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Saldo en wallet</TableHead>
                        <TableHead>Miembro desde</TableHead>
                        <TableHead>Estado wallet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((w) => (
                        <TableRow key={w.id} className="transition-colors duration-200">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-semibold text-primary text-sm">
                                  {w.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <p className="font-medium text-foreground">{w.user.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{w.user.email}</TableCell>
                          <TableCell>
                            <span className={`font-semibold ${w.saldo > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                              ${w.saldo.toLocaleString('es-CO')}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(w.user.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={w.saldo > 0 ? 'text-green-500 border-green-500/30' : 'text-muted-foreground'}>
                              {w.saldo > 0 ? 'Con saldo' : 'Sin saldo'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No se encontraron usuarios
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </Suspense>
  )
}
