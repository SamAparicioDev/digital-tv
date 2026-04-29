"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateBalance: (newBalance: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const login = async (email: string, password: string) => {
    const { user: userData } = await api.login(email, password)
    setUser(userData)
  }

  const register = async (name: string, email: string, password: string) => {
    const { user: userData } = await api.register(name, email, password)
    setUser(userData)
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
