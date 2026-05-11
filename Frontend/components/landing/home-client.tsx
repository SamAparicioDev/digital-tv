"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "./header"
import { Hero } from "./hero"
import { Promotions } from "./promotions"
import { Screens } from "./screens"
import { Releases } from "./releases"
import { Tutorials } from "./tutorials"
import { Footer } from "./footer"
import { WhatsAppButton } from "./whatsapp-button"
import { AuthModal } from "@/components/auth/auth-modal"
import { ProfilePanel } from "@/components/user/profile-panel"

export default function HomeClient() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const openAuth = () => setIsAuthModalOpen(true)
  const closeAuth = () => setIsAuthModalOpen(false)
  const openProfile = () => setIsProfileOpen(true)
  const closeProfile = () => setIsProfileOpen(false)

  const handleBuyClick = () => {
    if (isAuthenticated) {
      openProfile()
    } else {
      openAuth()
    }
  }

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
      <Header onLoginClick={openAuth} onProfileClick={openProfile} />
      <Hero onLoginClick={openAuth} />
      <Promotions onBuyClick={handleBuyClick} />
      <Screens onBuyClick={handleBuyClick} />
      <Releases />
      <Tutorials />
      <Footer />
      <WhatsAppButton />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuth} onSuccess={closeAuth} />
      <ProfilePanel isOpen={isProfileOpen} onClose={closeProfile} />
    </main>
  )
}
