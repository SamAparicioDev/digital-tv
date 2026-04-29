"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Monitor,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useSearchParams, Suspense } from "next/navigation";
import Loading from "./loading"; // Import the loading component

interface Screen {
  id: string;
  service: string;
  email: string;
  password: string;
  profile: string;
  pin: string;
  status: "available" | "sold" | "expired";
  expiresAt: string;
  assignedTo: string | null;
  price: number;
}

const mockScreens: Screen[] = [
  {
    id: "SCR001",
    service: "Netflix",
    email: "cuenta1@email.com",
    password: "Pass123!",
    profile: "Perfil 2",
    pin: "1234",
    status: "available",
    expiresAt: "2026-03-15",
    assignedTo: null,
    price: 25000,
  },
  {
    id: "SCR002",
    service: "Disney+",
    email: "disney@email.com",
    password: "Disney456!",
    profile: "Perfil 1",
    pin: "5678",
    status: "sold",
    expiresAt: "2026-02-28",
    assignedTo: "Juan Pérez",
    price: 20000,
  },
  {
    id: "SCR003",
    service: "HBO Max",
    email: "hbo@email.com",
    password: "HBO789!",
    profile: "Perfil 3",
    pin: "9012",
    status: "expired",
    expiresAt: "2026-01-10",
    assignedTo: null,
    price: 22000,
  },
  {
    id: "SCR004",
    service: "Prime Video",
    email: "prime@email.com",
    password: "Prime321!",
    profile: "Perfil 1",
    pin: "3456",
    status: "available",
    expiresAt: "2026-04-20",
    assignedTo: null,
    price: 18000,
  },
  {
    id: "SCR005",
    service: "Spotify",
    email: "spotify@email.com",
    password: "Spot654!",
    profile: "N/A",
    pin: "N/A",
    status: "sold",
    expiresAt: "2026-05-01",
    assignedTo: "María García",
    price: 15000,
  },
];

const services = [
  "Netflix",
  "Disney+",
  "HBO Max",
  "Prime Video",
  "Spotify",
  "YouTube Premium",
  "Paramount+",
  "Star+",
];

export default function AdminScreensPage() {
  const [screens, setScreens] = useState<Screen[]>(mockScreens);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newScreen, setNewScreen] = useState({
    service: "",
    email: "",
    password: "",
    profile: "",
    pin: "",
    expiresAt: "",
    price: "",
  });

  const filteredScreens = screens.filter((screen) => {
    const matchesSearch =
      screen.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (screen.assignedTo?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesService =
      filterService === "all" || screen.service === filterService;
    const matchesStatus =
      filterStatus === "all" || screen.status === filterStatus;
    return matchesSearch && matchesService && matchesStatus;
  });

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddScreen = () => {
    const screen: Screen = {
      id: `SCR${String(screens.length + 1).padStart(3, "0")}`,
      service: newScreen.service,
      email: newScreen.email,
      password: newScreen.password,
      profile: newScreen.profile,
      pin: newScreen.pin,
      status: "available",
      expiresAt: newScreen.expiresAt,
      assignedTo: null,
      price: Number.parseInt(newScreen.price),
    };
    setScreens([...screens, screen]);
    setNewScreen({
      service: "",
      email: "",
      password: "",
      profile: "",
      pin: "",
      expiresAt: "",
      price: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteScreen = (id: string) => {
    setScreens(screens.filter((s) => s.id !== id));
  };

  const getStatusBadge = (status: Screen["status"]) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disponible
          </Badge>
        );
      case "sold":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Clock className="w-3 h-3 mr-1" />
            Vendida
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Expirada
          </Badge>
        );
    }
  };

  const stats = {
    total: screens.length,
    available: screens.filter((s) => s.status === "available").length,
    sold: screens.filter((s) => s.status === "sold").length,
    expired: screens.filter((s) => s.status === "expired").length,
  };

  return (
    <Suspense fallback={<Loading />}> {/* Wrap the component with Suspense */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Gestión de Pantallas
            </h1>
            <p className="text-muted-foreground">
              Administra las cuentas y pantallas de streaming
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Pantalla
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Nueva Pantalla</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Servicio</Label>
                  <Select
                    value={newScreen.service}
                    onValueChange={(value) =>
                      setNewScreen({ ...newScreen, service: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={newScreen.email}
                    onChange={(e) =>
                      setNewScreen({ ...newScreen, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    value={newScreen.password}
                    onChange={(e) =>
                      setNewScreen({ ...newScreen, password: e.target.value })
                    }
                    placeholder="Contraseña de la cuenta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Perfil</Label>
                    <Input
                      value={newScreen.profile}
                      onChange={(e) =>
                        setNewScreen({ ...newScreen, profile: e.target.value })
                      }
                      placeholder="Perfil 1"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>PIN</Label>
                    <Input
                      value={newScreen.pin}
                      onChange={(e) =>
                        setNewScreen({ ...newScreen, pin: e.target.value })
                      }
                      placeholder="1234"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Fecha de Expiración</Label>
                    <Input
                      type="date"
                      value={newScreen.expiresAt}
                      onChange={(e) =>
                        setNewScreen({ ...newScreen, expiresAt: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Precio (COP)</Label>
                    <Input
                      type="number"
                      value={newScreen.price}
                      onChange={(e) =>
                        setNewScreen({ ...newScreen, price: e.target.value })
                      }
                      placeholder="25000"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddScreen}
                  className="w-full bg-primary text-primary-foreground"
                >
                  Agregar Pantalla
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Monitor,
              color: "text-foreground",
            },
            {
              label: "Disponibles",
              value: stats.available,
              icon: CheckCircle,
              color: "text-green-400",
            },
            {
              label: "Vendidas",
              value: stats.sold,
              icon: Clock,
              color: "text-primary",
            },
            {
              label: "Expiradas",
              value: stats.expired,
              icon: XCircle,
              color: "text-red-400",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email, ID o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="available">Disponibles</SelectItem>
                  <SelectItem value="sold">Vendidas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">
              Pantallas ({filteredScreens.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-secondary/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Credenciales</TableHead>
                    <TableHead>Perfil/PIN</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Asignado a</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredScreens.map((screen, index) => (
                      <motion.tr
                        key={screen.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-border hover:bg-secondary/30"
                      >
                        <TableCell className="font-mono text-sm">
                          {screen.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{screen.service}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm truncate max-w-[150px]">
                                {screen.email}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(screen.email)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">
                                {showPasswords[screen.id]
                                  ? screen.password
                                  : "••••••••"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => togglePassword(screen.id)}
                              >
                                {showPasswords[screen.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(screen.password)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{screen.profile}</p>
                            <p className="text-muted-foreground">
                              PIN: {screen.pin}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(screen.status)}</TableCell>
                        <TableCell>
                          {screen.assignedTo || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{screen.expiresAt}</TableCell>
                        <TableCell>
                          ${screen.price.toLocaleString("es-CO")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteScreen(screen.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
