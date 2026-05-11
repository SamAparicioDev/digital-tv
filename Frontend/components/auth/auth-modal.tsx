"use client"

import React, { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  X, Mail, Lock, User, Eye, EyeOff, Loader2, Play,
  Shield, UserCircle, TrendingUp, ChevronRight, ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role, User as UserType } from "@/lib/api"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// ─── Role routing helpers ─────────────────────────────────────────────────────

const ADMIN_ROLES = ['admin', 'ventas']

function getRouteForRole(role: Role): string {
  return ADMIN_ROLES.includes(role.nombre.toLowerCase()) ? '/admin' : '/dashboard'
}

function getRoleIcon(nombre: string) {
  const lower = nombre.toLowerCase()
  if (lower === 'admin') return Shield
  if (lower === 'ventas') return TrendingUp
  return UserCircle
}

function getRoleDescription(nombre: string): string {
  const lower = nombre.toLowerCase()
  if (lower === 'admin') return 'Acceso completo al panel de administración'
  if (lower === 'ventas') return 'Gestión de ofertas y transacciones'
  if (lower === 'cliente') return 'Acceso a tu cuenta y tienda'
  return 'Continuar con este rol'
}

function getRoleColor(nombre: string): string {
  const lower = nombre.toLowerCase()
  if (lower === 'admin') return 'border-red-500/40 bg-red-500/5 hover:border-red-500/70 hover:bg-red-500/10'
  if (lower === 'ventas') return 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500/70 hover:bg-blue-500/10'
  return 'border-primary/40 bg-primary/5 hover:border-primary/70 hover:bg-primary/10'
}

function getRoleIconColor(nombre: string): string {
  const lower = nombre.toLowerCase()
  if (lower === 'admin') return 'text-red-400 bg-red-500/10'
  if (lower === 'ventas') return 'text-blue-400 bg-blue-500/10'
  return 'text-primary bg-primary/10'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, register, setActiveRole } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<'auth' | 'role-select'>('auth')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [pendingUser, setPendingUser] = useState<UserType | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })

  // ── Validación ──────────────────────────────────────────────────────────────

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (mode === 'register' && !formData.name.trim()) e.name = 'El nombre es requerido'
    if (!formData.email.trim()) e.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email inválido'
    if (!formData.password) e.password = 'La contraseña es requerida'
    else if (formData.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (mode === 'register' && formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit de auth ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setApiError(null)

    try {
      let user: UserType

      if (mode === 'login') {
        user = await login(formData.email, formData.password)
      } else {
        user = await register(formData.name, formData.email, formData.password, formData.confirmPassword)
        // register auto-selecciona el rol Cliente → navegar directo
        router.push('/dashboard')
        onClose()
        onSuccess?.()
        return
      }

      const roles = user.roles ?? []

      if (roles.length === 0) {
        // Sin rol asignado → dashboard por defecto
        router.push('/dashboard')
        onClose()
        onSuccess?.()
        return
      }

      if (roles.length === 1) {
        // Un solo rol → auto-seleccionar y navegar
        setActiveRole(roles[0])
        router.push(getRouteForRole(roles[0]))
        onClose()
        onSuccess?.()
        return
      }

      // Más de un rol → interceptar y mostrar selector
      setPendingUser(user)
      setStep('role-select')

    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Error al procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Selección de rol ────────────────────────────────────────────────────────

  const handleRoleSelect = (role: Role) => {
    setActiveRole(role)
    router.push(getRouteForRole(role))
    onClose()
    onSuccess?.()
  }

  // ── Helpers UI ──────────────────────────────────────────────────────────────

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    setApiError(null)
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    setErrors({})
    setApiError(null)
    setPendingUser(null)
    setStep('auth')
  }

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={step === 'auth' ? onClose : undefined}
    >
      <Card
        className={cn(
          'w-full max-w-md bg-card border-border shadow-2xl',
          'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── STEP: Auth form ──────────────────────────────────────────────── */}
        {step === 'auth' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Play className="w-8 h-8 text-primary fill-primary" />
                <span className="text-xl font-bold">
                  Stream<span className="text-primary">Plus</span>
                </span>
              </div>
              <CardTitle className="text-2xl">
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Accede a tu cuenta para continuar'
                  : 'Regístrate para comenzar a disfrutar'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in slide-in-from-top-2">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={cn('pl-10', errors.name && 'border-destructive')}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn('pl-10', errors.email && 'border-destructive')}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={cn('pl-10', errors.confirmPassword && 'border-destructive')}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                    </span>
                  ) : mode === 'login' ? (
                    'Iniciar sesión'
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-primary font-medium hover:underline"
                    >
                      Regístrate
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-primary font-medium hover:underline"
                    >
                      Inicia sesión
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </>
        )}

        {/* ── STEP: Role selector ──────────────────────────────────────────── */}
        {step === 'role-select' && pendingUser && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Play className="w-8 h-8 text-primary fill-primary" />
              </div>
              <CardTitle className="text-xl">¿Con qué rol deseas continuar?</CardTitle>
              <CardDescription>
                Hola <strong>{pendingUser.name.split(' ')[0]}</strong>, tu cuenta tiene múltiples roles.
                Selecciona cómo quieres ingresar hoy.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-6">
              {(pendingUser.roles ?? []).map((role) => {
                const Icon = getRoleIcon(role.nombre)
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group',
                      getRoleColor(role.nombre)
                    )}
                  >
                    <div className={cn('p-2.5 rounded-lg flex-shrink-0', getRoleIconColor(role.nombre))}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-foreground capitalize">{role.nombre}</p>
                        {role.nombre.toLowerCase() === 'admin' && (
                          <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{getRoleDescription(role.nombre)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>
                )
              })}

              <button
                onClick={() => setStep('auth')}
                className="w-full flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
