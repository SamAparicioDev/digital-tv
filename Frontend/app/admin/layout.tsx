"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  Play,
  LayoutDashboard,
  Users,
  Wallet,
  Percent,
  Film,
  BarChart2,
  Menu,
  X,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Loader2,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Saldo", href: "/admin/saldo", icon: Wallet },
  { label: "Promociones", href: "/admin/promociones", icon: Percent },
  { label: "Estrenos", href: "/admin/estrenos", icon: Film },
  { label: "Reportes", href: "/admin/reportes", icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, isRoleResolved, isAdmin, activeRole, logout } = useAuth()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Guard: solo roles admin/ventas pueden acceder
  // Espera a que se resuelva el rol desde localStorage antes de redirigir
  useEffect(() => {
    if (!isLoading && isRoleResolved) {
      if (!user) {
        router.replace('/')
      } else if (!isAdmin) {
        router.replace('/dashboard')
      }
    }
  }, [isLoading, isRoleResolved, user, isAdmin, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading || !isRoleResolved || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-sidebar border-r border-sidebar-border",
          "flex flex-col transition-all duration-300 ease-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 group">
            <Play className="w-8 h-8 text-primary fill-primary transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground">
                <span className="text-primary">Admin</span>
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isSidebarCollapsed && "justify-center px-2"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + Settings */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/admin/configuracion"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200",
              isSidebarCollapsed && "justify-center px-2"
            )}
          >
            <Settings className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Configuración</span>}
          </Link>

          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/40 mt-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{activeRole?.nombre}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200",
              isSidebarCollapsed && "justify-center px-2"
            )}
            title={isSidebarCollapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Panel de Administración</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      {isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
