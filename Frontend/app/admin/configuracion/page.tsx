"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings, Bell, Shield, Palette, MessageSquare, CreditCard, Save, Loader2, Check, AlertCircle, Phone, MapPin,
} from "lucide-react"
import { api, type SiteSettings } from "@/lib/api"

const DEFAULTS: SiteSettings = {
  site_name: "DigitalTv",
  site_description: "Tu plataforma de streaming premium",
  support_email: "soporte@digitaltv.com",
  whatsapp_number: "+57 300 123 4567",
  support_phone: "+57 300 123 4567",
  support_address: "Colombia",
  enable_notifications: "1",
  enable_email_alerts: "1",
  enable_whatsapp_alerts: "0",
  maintenance_mode: "0",
  require_email_verification: "1",
  min_recharge_amount: "10000",
  max_recharge_amount: "500000",
  commission_percent: "5",
  welcome_bonus: "0",
}

const toBool = (v?: string) => v === "1" || v === "true"

export default function AdminConfigPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    api.getSettings()
      .then(s => setSettings({ ...DEFAULTS, ...s }))
      .catch(err => setError(err instanceof Error ? err.message : "Error cargando configuración"))
      .finally(() => setIsLoading(false))
  }, [])

  const set = (key: keyof SiteSettings, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setIsSaving(true); setError(null); setSavedOk(false)
    try {
      const updated = await api.updateSettings(settings)
      setSettings({ ...DEFAULTS, ...updated })
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración del sitio</h1>
          <p className="text-muted-foreground">Estos datos se reflejan en el header, footer y WhatsApp del landing</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
            : savedOk ? <><Check className="w-4 h-4 mr-2" />¡Guardado!</>
            : <><Save className="w-4 h-4 mr-2" />Guardar cambios</>}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="general" className="gap-2"><Settings className="w-4 h-4" />General</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Notificaciones</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" />Seguridad</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2"><CreditCard className="w-4 h-4" />Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />Información del Sitio
                </CardTitle>
                <CardDescription>Lo que verán tus visitantes en el landing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nombre del Sitio</Label>
                    <Input id="siteName" value={settings.site_name ?? ""}
                      onChange={(e) => set("site_name", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Email de Soporte</Label>
                    <Input id="supportEmail" type="email" value={settings.support_email ?? ""}
                      onChange={(e) => set("support_email", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descripción</Label>
                  <Textarea id="siteDescription" value={settings.site_description ?? ""}
                    onChange={(e) => set("site_description", e.target.value)}
                    className="bg-secondary border-border" rows={3} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />Contacto y soporte
                </CardTitle>
                <CardDescription>Estos datos aparecen en el footer y el botón flotante de WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />Número de WhatsApp
                    </Label>
                    <Input id="whatsapp" value={settings.whatsapp_number ?? ""}
                      onChange={(e) => set("whatsapp_number", e.target.value)}
                      className="bg-secondary border-border" placeholder="+57 300 123 4567" />
                    <p className="text-xs text-muted-foreground">Solo dígitos y +. Ej: +573001234567</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />Teléfono de soporte
                    </Label>
                    <Input id="phone" value={settings.support_phone ?? ""}
                      onChange={(e) => set("support_phone", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />Ubicación
                  </Label>
                  <Input id="address" value={settings.support_address ?? ""}
                    onChange={(e) => set("support_address", e.target.value)}
                    className="bg-secondary border-border" placeholder="Ciudad, País" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />Preferencias</CardTitle>
                <CardDescription>Configura cómo y cuándo enviar notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "enable_notifications" as const, label: "Notificaciones Push", desc: "Enviar notificaciones push a los usuarios" },
                  { key: "enable_email_alerts" as const, label: "Alertas por Email", desc: "Enviar alertas importantes por correo electrónico" },
                  { key: "enable_whatsapp_alerts" as const, label: "Alertas por WhatsApp", desc: "Enviar alertas de ventas por WhatsApp" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={toBool(settings[item.key])}
                      onCheckedChange={(checked) => set(item.key, checked ? "1" : "0")} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Seguridad</CardTitle>
                <CardDescription>Administra la seguridad de la plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "maintenance_mode" as const, label: "Modo Mantenimiento", desc: "Activar modo mantenimiento (solo admins pueden acceder)" },
                  { key: "require_email_verification" as const, label: "Verificación de Email", desc: "Requerir verificación de email al registrarse" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={toBool(settings[item.key])}
                      onCheckedChange={(checked) => set(item.key, checked ? "1" : "0")} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Pagos</CardTitle>
                <CardDescription>Configura los límites y comisiones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minRecharge">Recarga Mínima (COP)</Label>
                    <Input id="minRecharge" type="number" value={settings.min_recharge_amount ?? ""}
                      onChange={(e) => set("min_recharge_amount", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRecharge">Recarga Máxima (COP)</Label>
                    <Input id="maxRecharge" type="number" value={settings.max_recharge_amount ?? ""}
                      onChange={(e) => set("max_recharge_amount", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="commission">Comisión (%)</Label>
                    <Input id="commission" type="number" value={settings.commission_percent ?? ""}
                      onChange={(e) => set("commission_percent", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="welcomeBonus">Bono de Bienvenida (COP)</Label>
                    <Input id="welcomeBonus" type="number" value={settings.welcome_bonus ?? ""}
                      onChange={(e) => set("welcome_bonus", e.target.value)}
                      className="bg-secondary border-border" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
