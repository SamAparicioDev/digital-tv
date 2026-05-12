"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FadeIn } from "@/components/animations/motion"
import {
  User, Mail, Lock, Shield, Smartphone, Save, Loader2, Check, AlertCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

export default function ConfiguracionPage() {
  const { user, refreshUser } = useAuth()

  // ── Perfil ────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" })
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileOk, setProfileOk] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "" })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setProfileError(null); setProfileOk(false); setSavingProfile(true)
    try {
      await api.updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim() || null,
      })
      await refreshUser()
      setProfileOk(true)
      setTimeout(() => setProfileOk(false), 2500)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Contraseña ────────────────────────────────────────────────────────────
  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" })
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdOk, setPwdOk] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const handleChangePassword = async () => {
    setPwdError(null); setPwdOk(false)
    if (!pwd.current || !pwd.new) { setPwdError("Completa ambos campos"); return }
    if (pwd.new.length < 8) { setPwdError("La nueva contraseña debe tener al menos 8 caracteres"); return }
    if (pwd.new !== pwd.confirm) { setPwdError("Las contraseñas no coinciden"); return }

    setSavingPwd(true)
    try {
      await api.changePassword({
        current_password: pwd.current,
        new_password: pwd.new,
        new_password_confirmation: pwd.confirm,
      })
      setPwdOk(true)
      setPwd({ current: "", new: "", confirm: "" })
      setTimeout(() => setPwdOk(false), 2500)
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "Error al cambiar contraseña")
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Actualiza tu información personal y de seguridad</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Información personal ─────────────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Información personal</CardTitle>
              </div>
              <CardDescription>Estos datos quedarán guardados en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="pl-10" placeholder="Tu nombre" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-10" placeholder="tu@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10" placeholder="+57 300 123 4567" />
                </div>
              </div>

              {profileError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500">{profileError}</p>
                </div>
              )}

              <Button onClick={handleSaveProfile} disabled={savingProfile}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {savingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
                  : profileOk ? <><Check className="w-4 h-4 mr-2" />¡Guardado!</>
                  : <><Save className="w-4 h-4 mr-2" />Guardar cambios</>}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* ── Contraseña ───────────────────────────────────────────────────── */}
        <FadeIn delay={0.15}>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Cambiar contraseña</CardTitle>
              </div>
              <CardDescription>Verifica tu contraseña actual antes de cambiarla</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="currentPassword" type="password" value={pwd.current}
                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                    className="pl-10" placeholder="••••••••" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="newPassword" type="password" value={pwd.new}
                    onChange={(e) => setPwd({ ...pwd, new: e.target.value })}
                    className="pl-10" placeholder="Mínimo 8 caracteres" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                    className="pl-10" placeholder="••••••••" />
                </div>
              </div>

              {pwdError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500">{pwdError}</p>
                </div>
              )}

              <Button onClick={handleChangePassword} disabled={savingPwd}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
                {savingPwd ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cambiando...</>
                  : pwdOk ? <><Check className="w-4 h-4 mr-2" />¡Contraseña actualizada!</>
                  : <><Lock className="w-4 h-4 mr-2" />Cambiar contraseña</>}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
