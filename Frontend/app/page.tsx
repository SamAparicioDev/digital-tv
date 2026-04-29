"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Promotions } from "@/components/landing/promotions"
import { Screens } from "@/components/landing/screens"
import { Releases } from "@/components/landing/releases"
import { Tutorials } from "@/components/landing/tutorials"
import { Footer } from "@/components/landing/footer"
import { WhatsAppButton } from "@/components/landing/whatsapp-button"
import { AuthModal } from "@/components/auth/auth-modal"
import { ProfilePanel } from "@/components/user/profile-panel"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleBuyClick = () => {
    if (isAuthenticated) {
      setIsProfileOpen(true)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header 
        onLoginClick={() => setIsAuthModalOpen(true)} 
        onProfileClick={() => setIsProfileOpen(true)}
      />
      
      <Hero onLoginClick={() => isAuthenticated ? setIsProfileOpen(true) : setIsAuthModalOpen(true)} />
      
      <Promotions onBuyClick={handleBuyClick} />
      
      <Screens onBuyClick={handleBuyClick} />
      
      <Releases />
      
      <Tutorials />
      
      <Footer />
      
      <WhatsAppButton />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Profile Panel (Sheet) */}
      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </main>
  )
}
