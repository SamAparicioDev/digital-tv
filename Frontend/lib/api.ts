// API Service - Preparado para conectar con Laravel
// Cambia USE_MOCK a false y configura LARAVEL_API_URL para conectar con tu backend

const USE_MOCK = true // Cambiar a false cuando conectes con Laravel

// Solo se usa cuando USE_MOCK es false
const getLaravelApiUrl = () => {
  if (typeof window !== "undefined" && !USE_MOCK) {
    return window.location.origin.includes("localhost") 
      ? "http://localhost:8000/api" 
      : "/api" // Ajustar a tu URL de producción
  }
  return "http://localhost:8000/api"
}

const LARAVEL_API_URL = getLaravelApiUrl()

// Types
export interface User {
  id: number
  name: string
  email: string
  balance: number
  avatar?: string
  phone?: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Transaction {
  id: number
  type: "compra" | "recarga" | "reembolso"
  description: string
  amount: number
  date: string
  status: "completado" | "pendiente" | "cancelado"
}

export interface Screen {
  id: number
  platform: string
  email: string
  password: string
  profile: string
  pin?: string
  expiry: string
  status: "activo" | "expirado" | "pendiente"
}

export interface Promotion {
  id: number
  title: string
  description: string
  discount: number
  image: string
  endDate: string
}

export interface Release {
  id: number
  title: string
  type: "pelicula" | "serie"
  platform: string
  image: string
  rating: number
  year: number
  description: string
}

// Mock Data
const mockUser: User = {
  id: 1,
  name: "Juan Pérez",
  email: "juan@email.com",
  balance: 150000, // Saldo en pesos colombianos
  phone: "+1234567890",
  created_at: "2024-01-15",
}

const mockTransactions: Transaction[] = [
  { id: 1, type: "compra", description: "Netflix Premium - 1 Pantalla", amount: -25000, date: "2024-01-20", status: "completado" },
  { id: 2, type: "recarga", description: "Recarga de saldo", amount: 100000, date: "2024-01-18", status: "completado" },
  { id: 3, type: "compra", description: "Disney+ - 1 Pantalla", amount: -20000, date: "2024-01-15", status: "completado" },
  { id: 4, type: "recarga", description: "Recarga de saldo", amount: 150000, date: "2024-01-10", status: "completado" },
  { id: 5, type: "compra", description: "HBO Max - 1 Pantalla", amount: -22000, date: "2024-01-05", status: "completado" },
]

const mockScreens: Screen[] = [
  { id: 1, platform: "Netflix", email: "cuenta1@stream.com", password: "pass123", profile: "Perfil 1", pin: "1234", expiry: "2024-02-20", status: "activo" },
  { id: 2, platform: "Disney+", email: "cuenta2@stream.com", password: "disney456", profile: "Perfil 2", expiry: "2024-02-15", status: "activo" },
  { id: 3, platform: "HBO Max", email: "cuenta3@stream.com", password: "hbo789", profile: "Perfil 1", expiry: "2024-01-25", status: "expirado" },
]

// Storage helper
const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

const setToken = (token: string) => {
  localStorage.setItem("auth_token", token)
}

const removeToken = () => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user")
}

// API Headers
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
  
  if (includeAuth) {
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }
  
  return headers
}

// API Functions
export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000))
      const token = "mock_token_" + Date.now()
      setToken(token)
      localStorage.setItem("user", JSON.stringify(mockUser))
      return { user: mockUser, token }
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Error al iniciar sesión")
    }
    
    const data = await res.json()
    setToken(data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  },
  
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000))
      const newUser = { ...mockUser, name, email, id: Date.now() }
      const token = "mock_token_" + Date.now()
      setToken(token)
      localStorage.setItem("user", JSON.stringify(newUser))
      return { user: newUser, token }
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password }),
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Error al registrarse")
    }
    
    const data = await res.json()
    setToken(data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  },
  
  async logout(): Promise<void> {
    if (!USE_MOCK) {
      try {
        await fetch(`${LARAVEL_API_URL}/auth/logout`, {
          method: "POST",
          headers: getHeaders(),
        })
      } catch {
        // Ignore logout errors
      }
    }
    removeToken()
  },
  
  async getUser(): Promise<User | null> {
    if (USE_MOCK) {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    }
    
    const token = getToken()
    if (!token) return null
    
    try {
      const res = await fetch(`${LARAVEL_API_URL}/user`, {
        headers: getHeaders(),
      })
      
      if (!res.ok) {
        removeToken()
        return null
      }
      
      return res.json()
    } catch {
      return null
    }
  },
  
  // Balance
  async getBalance(): Promise<number> {
    if (USE_MOCK) {
      const stored = localStorage.getItem("user")
      const user = stored ? JSON.parse(stored) : null
      return user?.balance || 0
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/user/balance`, {
      headers: getHeaders(),
    })
    
    if (!res.ok) throw new Error("Error al obtener saldo")
    const data = await res.json()
    return data.balance
  },
  
  async rechargeBalance(amount: number, method: string): Promise<{ success: boolean; newBalance: number }> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1500))
      const stored = localStorage.getItem("user")
      const user = stored ? JSON.parse(stored) : mockUser
      user.balance += amount
      localStorage.setItem("user", JSON.stringify(user))
      return { success: true, newBalance: user.balance }
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/user/recharge`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, method }),
    })
    
    if (!res.ok) throw new Error("Error al recargar saldo")
    return res.json()
  },
  
  // Transactions
  async getTransactions(filters?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<Transaction[]> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      // Get from localStorage first, fallback to mock
      const stored = localStorage.getItem("user_transactions")
      let result: Transaction[] = stored ? JSON.parse(stored) : [...mockTransactions]
      if (filters?.type && filters.type !== "todos") {
        result = result.filter(t => t.type === filters.type)
      }
      return result
    }
    
    const params = new URLSearchParams()
    if (filters?.type) params.append("type", filters.type)
    if (filters?.dateFrom) params.append("date_from", filters.dateFrom)
    if (filters?.dateTo) params.append("date_to", filters.dateTo)
    
    const res = await fetch(`${LARAVEL_API_URL}/transactions?${params}`, {
      headers: getHeaders(),
    })
    
    if (!res.ok) throw new Error("Error al obtener transacciones")
    return res.json()
  },
  
  // Screens
  async getMyScreens(): Promise<Screen[]> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      // Get from localStorage first, fallback to mock
      const stored = localStorage.getItem("user_screens")
      return stored ? JSON.parse(stored) : [...mockScreens]
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/screens/my`, {
      headers: getHeaders(),
    })
    
    if (!res.ok) throw new Error("Error al obtener pantallas")
    return res.json()
  },
  
  // Update Profile
  async updateProfile(data: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 800))
      const stored = localStorage.getItem("user")
      const user = stored ? JSON.parse(stored) : mockUser
      const updated = { ...user, ...data }
      localStorage.setItem("user", JSON.stringify(updated))
      return updated
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/user/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!res.ok) throw new Error("Error al actualizar perfil")
    return res.json()
  },
  
  // Check if authenticated
  isAuthenticated(): boolean {
    return !!getToken()
  },

  // Purchase screen
  async purchaseScreen(product: {
    id: string
    name: string
    price: number
    category: string
    duration: string
  }): Promise<{ success: boolean; screen: Screen; newBalance: number; transaction: Transaction }> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1500))
      
      // Get current user
      const stored = localStorage.getItem("user")
      console.log("[v0] purchaseScreen - stored user:", stored)
      if (!stored) throw new Error("Usuario no autenticado")
      const user = JSON.parse(stored)
      
      console.log("[v0] purchaseScreen - user balance:", user.balance, "product price:", product.price)
      
      // Check balance
      if (user.balance < product.price) {
        throw new Error("Saldo insuficiente")
      }
      
      // Deduct balance
      user.balance -= product.price
      localStorage.setItem("user", JSON.stringify(user))
      console.log("[v0] purchaseScreen - new balance saved:", user.balance)
      
      // Create new screen
      const newScreen: Screen = {
        id: Date.now(),
        platform: product.category,
        email: `${product.category.toLowerCase().replace(/[+\s]/g, "")}${Date.now()}@streamplus.com`,
        password: `SP${Math.random().toString(36).substring(2, 10)}`,
        profile: "Perfil 1",
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "activo",
      }
      
      // Save screen to localStorage
      const screensStored = localStorage.getItem("user_screens")
      const screens: Screen[] = screensStored ? JSON.parse(screensStored) : []
      screens.unshift(newScreen)
      localStorage.setItem("user_screens", JSON.stringify(screens))
      
      // Create transaction
      const newTransaction: Transaction = {
        id: Date.now(),
        type: "compra",
        description: `${product.name} - ${product.duration}`,
        amount: -product.price,
        date: new Date().toISOString(),
        status: "completado",
      }
      
      // Save transaction
      const txStored = localStorage.getItem("user_transactions")
      const transactions: Transaction[] = txStored ? JSON.parse(txStored) : []
      transactions.unshift(newTransaction)
      localStorage.setItem("user_transactions", JSON.stringify(transactions))
      
      console.log("[v0] purchaseScreen - purchase complete, screens saved:", screens.length, "transactions:", transactions.length)
      
      return {
        success: true,
        screen: newScreen,
        newBalance: user.balance,
        transaction: newTransaction,
      }
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/screens/purchase`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(product),
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Error al realizar la compra")
    }
    
    return res.json()
  },

  // Admin: Get all users
  async getUsers(): Promise<User[]> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      return [
        { id: 1, name: "Juan Pérez", email: "juan@email.com", balance: 150000, created_at: "2024-01-15" },
        { id: 2, name: "María García", email: "maria@email.com", balance: 75500, created_at: "2024-01-18" },
        { id: 3, name: "Carlos López", email: "carlos@email.com", balance: 200000, created_at: "2024-01-20" },
        { id: 4, name: "Ana Rodríguez", email: "ana@email.com", balance: 50000, created_at: "2024-01-22" },
        { id: 5, name: "Pedro Martínez", email: "pedro@email.com", balance: 0, created_at: "2024-01-25" },
      ]
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/admin/users`, {
      headers: getHeaders(),
    })
    
    if (!res.ok) throw new Error("Error al obtener usuarios")
    return res.json()
  },

  // Admin: Add balance to user
  async addUserBalance(userId: number, amount: number, description?: string): Promise<{ success: boolean; newBalance: number }> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 800))
      // Mock success
      return { success: true, newBalance: amount }
    }
    
    const res = await fetch(`${LARAVEL_API_URL}/admin/users/${userId}/balance`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount, description }),
    })
    
    if (!res.ok) throw new Error("Error al agregar saldo")
    return res.json()
  },
}

export default api
