"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FadeIn } from "@/components/animations/motion"
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield,
  Smartphone,
  Save,
  Loader2,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ConfiguracionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [user, setUser] = useState({ name: "", email: "" })
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    promotions: true,
    security: true,
  })

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    localStorage.setItem("user", JSON.stringify(user))
    setIsLoading(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Administra tu cuenta y preferencias
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <FadeIn delay={0.1}>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Información personal</CardTitle>
              </div>
              <CardDescription>Actualiza tu información de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="pl-10"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="pl-10"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Security Settings */}
        <FadeIn delay={0.15}>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Seguridad</CardTitle>
              </div>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
                Cambiar contraseña
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Notification Settings */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle>Notificaciones</CardTitle>
              </div>
              <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    key: "email",
                    title: "Notificaciones por email",
                    description: "Recibe actualizaciones importantes en tu correo",
                    icon: Mail,
                  },
                  {
                    key: "push",
                    title: "Notificaciones push",
                    description: "Recibe alertas en tiempo real en tu navegador",
                    icon: Bell,
                  },
                  {
                    key: "promotions",
                    title: "Promociones y ofertas",
                    description: "Entérate de las mejores ofertas y descuentos",
                    icon: Shield,
                  },
                  {
                    key: "security",
                    title: "Alertas de seguridad",
                    description: "Recibe avisos sobre actividad sospechosa",
                    icon: Lock,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Save Button */}
      <FadeIn delay={0.25}>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </span>
            ) : showSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Guardado
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar cambios
              </span>
            )}
          </Button>
        </div>
      </FadeIn>
    </div>
  )
}
