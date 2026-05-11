"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, Coins, User, ChevronDown, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onLoginClick: () => void
  onProfileClick: () => void
}

export function Header({ onLoginClick, onProfileClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Inicio", href: "#hero" },
    { label: "Promociones", href: "#promociones" },
    { label: "Pantallas", href: "#pantallas" },
    { label: "Estrenos", href: "#estrenos" },
    { label: "Tutoriales", href: "#tutoriales" },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-transparent",
        "animate-in fade-in slide-in-from-top-4 duration-500"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-m2jddRXSFYlrahyQfPp0OEWhxRTKDl.png" 
                alt="DigitalTv Logo" 
                className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Digital<span className="text-primary">Tv</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Menú / Panel button */}
                <Button
                  onClick={() => router.push(isAdmin ? '/admin' : '/dashboard')}
                  className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                  size="sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Menú
                </Button>

                {/* Balance Button */}
                <Button
                  variant="outline"
                  onClick={onProfileClick}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                >
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    ${user.balance.toFixed(2)}
                  </span>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-secondary/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-foreground">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuItem 
                      onClick={onProfileClick}
                      className="cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onProfileClick}
                      className="cursor-pointer"
                    >
                      <Coins className="w-4 h-4 mr-2 text-primary" />
                      <span>Saldo: </span>
                      <span className="ml-auto font-semibold text-primary">${user.balance.toFixed(2)}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Balance Indicator (Guest) */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                  <Coins className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    $0.00
                  </span>
                </div>

                {/* Login Button */}
                <Button
                  onClick={onLoginClick}
                  className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                >
                  <span className="relative z-10">Iniciar Sesión</span>
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-[500px] pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile User Section */}
            {isAuthenticated && user ? (
              <>
                <div className="border-t border-border my-2" />
                <button
                  onClick={() => { setIsMobileMenuOpen(false); router.push(isAdmin ? '/admin' : '/dashboard') }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 rounded-lg transition-all duration-200 w-full text-left"
                >
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Menú</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onProfileClick()
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 rounded-lg transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Saldo:</span>
                  <span className="ml-auto text-lg font-bold text-primary">${user.balance.toFixed(2)}</span>
                </div>
                <Button
                  variant="destructive"
                  className="mx-4 mt-2"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 mt-2 rounded-lg bg-secondary/30">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Saldo: $0.00</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
