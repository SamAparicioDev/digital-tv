"use client"

import React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres"
    }
    
    if (mode === "register" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setApiError(null)
    
    try {
      if (mode === "login") {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }
      
      onClose()
      onSuccess?.()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    setApiError(null)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" })
    setErrors({})
    setApiError(null)
  }

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className={cn(
          "w-full max-w-md bg-card border-border shadow-2xl",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
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
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Accede a tu cuenta para continuar"
              : "Regístrate para comenzar a disfrutar"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* API Error */}
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in slide-in-from-top-2">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register only) */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={cn(
                      "pl-10",
                      errors.name && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive animate-in slide-in-from-left-2">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive animate-in slide-in-from-left-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={cn(
                    "pl-10 pr-10",
                    errors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive animate-in slide-in-from-left-2">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={cn(
                      "pl-10",
                      errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive animate-in slide-in-from-left-2">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Forgot Password Link */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "login" ? "Iniciando sesión..." : "Creando cuenta..."}
                </span>
              ) : mode === "login" ? (
                "Iniciar sesión"
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-primary font-medium hover:underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
