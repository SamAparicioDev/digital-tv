"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  MessageSquare,
  CreditCard,
  Save,
  Upload,
} from "lucide-react";

export default function AdminConfigPage() {
  const [settings, setSettings] = useState({
    siteName: "DigitalTv",
    siteDescription: "Tu plataforma de streaming premium",
    supportEmail: "soporte@digitaltv.com",
    whatsappNumber: "+57 300 123 4567",
    enableNotifications: true,
    enableEmailAlerts: true,
    enableWhatsappAlerts: false,
    maintenanceMode: false,
    requireEmailVerification: true,
    minRechargeAmount: "10000",
    maxRechargeAmount: "500000",
    commissionPercent: "5",
    welcomeBonus: "5000",
  });

  const handleSave = () => {
    console.log("Guardando configuración:", settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">
            Administra la configuración general del sistema
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Pagos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Información del Sitio
                </CardTitle>
                <CardDescription>
                  Configura la información básica de tu plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nombre del Sitio</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Email de Soporte</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          supportEmail: e.target.value,
                        })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descripción</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        siteDescription: e.target.value,
                      })
                    }
                    className="bg-secondary border-border"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo del Sitio</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">S+</span>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Configura el número de WhatsApp para soporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="bg-secondary border-border"
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Preferencias de Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura cómo y cuándo enviar notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones push a los usuarios
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar alertas importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableEmailAlerts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar alertas de ventas por WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableWhatsappAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableWhatsappAlerts: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Configuración de Seguridad
                </CardTitle>
                <CardDescription>
                  Administra la seguridad de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Activar modo mantenimiento (solo admins pueden acceder)
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Verificación de Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir verificación de email al registrarse
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        requireEmailVerification: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Configuración de Pagos
                </CardTitle>
                <CardDescription>
                  Configura los límites y comisiones de pagos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minRecharge">Recarga Mínima (COP)</Label>
                    <Input
                      id="minRecharge"
                      type="number"
                      value={settings.minRechargeAmount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minRechargeAmount: e.target.value,
                        })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRecharge">Recarga Máxima (COP)</Label>
                    <Input
                      id="maxRecharge"
                      type="number"
                      value={settings.maxRechargeAmount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxRechargeAmount: e.target.value,
                        })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="commission">Comisión (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      value={settings.commissionPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          commissionPercent: e.target.value,
                        })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="welcomeBonus">Bono de Bienvenida (COP)</Label>
                    <Input
                      id="welcomeBonus"
                      type="number"
                      value={settings.welcomeBonus}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          welcomeBonus: e.target.value,
                        })
                      }
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
