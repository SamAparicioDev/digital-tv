"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api, type User, type Role } from "@/lib/api"

// Roles que tienen acceso al panel de administración
const ADMIN_ROLES = ['admin', 'ventas']

function isAdminRole(role: Role | null): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role.nombre.toLowerCase())
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isLoggingOut: boolean
  isRoleResolved: boolean
  isAuthenticated: boolean
  activeRole: Role | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateBalance: (newBalance: number) => void
  setActiveRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeRole, setActiveRoleState] = useState<Role | null>(null)
  const [isRoleResolved, setIsRoleResolved] = useState(false)

  // Carga el rol activo desde localStorage en el primer render (cliente)
  useEffect(() => {
    const stored = localStorage.getItem('active_role')
    if (stored) {
      try { setActiveRoleState(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setIsRoleResolved(true)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getUser()
      setUser(userData)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      if (api.isAuthenticated()) {
        await refreshUser()
      }
      setIsLoading(false)
    }
    initAuth()
  }, [refreshUser])

  const setActiveRole = (role: Role) => {
    setActiveRoleState(role)
    localStorage.setItem('active_role', JSON.stringify(role))
  }

  const login = async (email: string, password: string): Promise<User> => {
    // Clear any stale role from a previous session before starting fresh
    setActiveRoleState(null)
    localStorage.removeItem('active_role')
    const { user: userData } = await api.login(email, password)
    setUser(userData)
    return userData
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<User> => {
    const { user: userData } = await api.register(name, email, password, passwordConfirmation)
    setUser(userData)
    // El registro siempre asigna rol Cliente → auto-seleccionar
    const clienteRole = userData.roles?.[0]
    if (clienteRole) setActiveRole(clienteRole)
    return userData
  }

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      await api.logout()
    } finally {
      setUser(null)
      setActiveRoleState(null)
      localStorage.removeItem('active_role')
      setIsLoggingOut(false)
    }
  }

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updated = { ...user, balance: newBalance }
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggingOut,
        isRoleResolved,
        isAuthenticated: !!user,
        activeRole,
        isAdmin: isAdminRole(activeRole),
        login,
        register,
        logout,
        refreshUser,
        updateBalance,
        setActiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
