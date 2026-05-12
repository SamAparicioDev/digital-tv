// API Service - Conectado con backend Laravel
const API_BASE = (() => {
  const env = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined
  if (typeof env === 'string' && env.trim()) {
    const base = env.replace(/\/$/, '')
    return base.endsWith('/api') ? base : `${base}/api`
  }
  return 'http://localhost:8000/api'
})()

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: string   // UUID en la BD
  nombre: string
}

export interface Wallet {
  id: number
  user_id: number
  saldo: number
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  is_active: boolean
  /** Mapped from wallet.saldo on login/register/getUser */
  balance: number
  created_at: string
  roles?: Role[]
  wallet?: Wallet
}

// Settings públicos del sitio (footer, whatsapp, etc.)
export interface SiteSettings {
  site_name?: string
  site_description?: string
  support_email?: string
  whatsapp_number?: string
  support_phone?: string
  support_address?: string
  enable_notifications?: string
  enable_email_alerts?: string
  enable_whatsapp_alerts?: string
  maintenance_mode?: string
  require_email_verification?: string
  min_recharge_amount?: string
  max_recharge_amount?: string
  commission_percent?: string
  welcome_bonus?: string
  [k: string]: string | undefined
}

export interface NumeroCuenta {
  id: number
  numero: string
  descripcion: string | null
}

export interface MetodoPago {
  id: number
  nombre: string
  tipo: 'banco' | 'sistema'
  emoji: string | null
  color: string | null
  is_active: boolean
  numero_cuentas: NumeroCuenta[]
}

export interface Transaccion {
  id: number
  wallet_id: number
  metodo_pago_id: number | null
  referencia_pago: string | null
  comprobante_url: string | null
  /** 'deposit' = recarga/crédito, 'withdraw' = compra/débito */
  tipo: 'deposit' | 'withdraw'
  monto: number
  saldo_anterior: number
  saldo_nuevo: number
  /** Valores en mayúsculas tal como los define la BD */
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  descripcion: string
  created_at: string
  updated_at: string
  metodo_pago?: MetodoPago
}

export interface RecargasResponse {
  saldo_actual: number
  wallet_id: number
  transacciones: Transaccion[]
}

export interface StreamingService {
  id: number
  name: string
  slug: string
  logo_url: string | null
  primary_color: string | null
  cantidad_cuentas: number
  is_active: boolean
}

export interface OfertaServicioPivot {
  numero_perfiles: number
  duracion_dias: number
  is_active: boolean
}

export interface StreamingServiceWithPivot extends StreamingService {
  pivot: OfertaServicioPivot
}

export interface Oferta {
  id: number
  garantia_dias: number
  precio: number
  cuenta_completa: boolean
  is_active: boolean
  stock: number
  servicios: StreamingServiceWithPivot[]
}

export interface DatosAcceso {
  tipo: 'cuenta_completa' | 'perfil'
  email: string
  password?: string
  perfil_nombre?: string
  perfil_pin?: string
  vigencia_hasta: string
}

export interface Compra {
  id: number
  user_id: number
  oferta_id: number
  transaccion_id: number
  precio_compra: number
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  nota: string | null
  datos_acceso: string | null
  created_at: string
  updated_at: string
  oferta?: Oferta
  transaccion?: Transaccion
}

export interface WalletWithUser extends Wallet {
  user: Pick<User, 'id' | 'name' | 'email' | 'created_at'>
}

export interface AdminTransaccion extends Transaccion {
  wallet: WalletWithUser
  compra?: Compra
}

export interface AuthResponse {
  ok: boolean
  message: string
  user: User
  token: string
}

// ─── Descuento ────────────────────────────────────────────────────────────────

export interface DescuentoRole {
  id: number
  nombre: string
  pivot: {
    valor_descuento: number
    tipo_descuento: 'porcentaje' | 'fijo'
    is_active: boolean
  }
}

export interface Descuento {
  id: number
  codigo: string | null
  nombre: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string | null
  es_recurrente: boolean
  is_active: boolean
  streaming_service_id: number | null
  valor_global: number | null
  tipo_global: 'porcentaje' | 'fijo' | null
  created_at: string
  updated_at: string
  roles?: DescuentoRole[]
  streaming_service?: { id: number; name: string; primary_color: string | null } | null
  streaming_services?: { id: number; name: string; primary_color: string | null }[]
}

// ─── Cuentas / Credenciales ───────────────────────────────────────────────────

export interface PerfilAdmin {
  id: number
  nombre: string
  pin: string | null
  is_active: boolean
  disponible: boolean
}

export interface CuentaAdmin {
  id: number
  streaming_service_id: number
  streaming_service: { id: number; name: string; primary_color: string | null; logo_url: string | null } | null
  email: string
  password: string
  descripcion: string | null
  vigencia_hasta: string | null
  is_active: boolean
  cuenta_asignada: boolean
  disponible_como_completa: boolean
  perfiles_total: number
  perfiles_disponibles: number
  perfiles: PerfilAdmin[]
}

export interface MiCuenta {
  id: number
  compra_id: number
  tipo: 'cuenta_completa' | 'perfil'
  servicio: string
  servicio_color: string
  servicio_logo: string | null
  email: string | null
  password: string | null
  perfil: { nombre: string; pin: string | null } | null
  vigencia_desde: string
  vigencia_hasta: string
  vigente: boolean
  dias_restantes: number
}

// ─── Estrenos ─────────────────────────────────────────────────────────────────

export interface Estreno {
  id: number
  titulo: string
  formato: 'pelicula' | 'serie'
  imagen: string | null
  imagen_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  streaming_services?: { id: number; name: string; primary_color: string | null; logo_url: string | null }[]
}

// ─── Tutoriales + Categorías ──────────────────────────────────────────────────

export interface TutorialCategoria {
  id: number
  nombre: string
  descripcion: string | null
  is_active: boolean
}

export interface Tutorial {
  id: number
  titulo: string
  descripcion: string | null
  youtube_url: string
  youtube_id: string | null
  duracion: string | null
  categoria_id: number | null
  is_active: boolean
  thumbnail_url: string | null
  embed_url: string | null
  categoria?: TutorialCategoria | null
  created_at: string
  updated_at: string
}

// ─── Deprecated types kept for UI compatibility ───────────────────────────────
/** @deprecated No existe en el backend. Las compras no incluyen credenciales. */
export interface Screen {
  id: number
  platform: string
  email: string
  password: string
  profile: string
  pin?: string
  expiry: string
  status: 'activo' | 'expirado' | 'pendiente'
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

const setToken = (token: string) => localStorage.setItem('auth_token', token)

const removeToken = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function headers(auth = true): HeadersInit {
  const h: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (auth) {
    const token = getToken()
    if (token) h['Authorization'] = `Bearer ${token}`
  }
  return h
}

function mapUserBalance(raw: User & { wallet?: Wallet }): User {
  const saldo = raw.wallet?.saldo ?? 0
  return { ...raw, balance: Number(saldo) }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message || err.error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/ingresar`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ email, password }),
    })
    const data = await handleResponse<AuthResponse>(res)
    const user = mapUserBalance(data.user)
    setToken(data.token)
    localStorage.setItem('user', JSON.stringify(user))
    return { ...data, user }
  },

  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/registrar`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
    })
    const data = await handleResponse<AuthResponse>(res)
    const user = mapUserBalance(data.user)
    setToken(data.token)
    localStorage.setItem('user', JSON.stringify(user))
    return { ...data, user }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/logout`, { method: 'POST', headers: headers() })
    } catch {
      // ignore network errors on logout
    }
    removeToken()
  },

  async getUser(): Promise<User | null> {
    if (!getToken()) return null
    try {
      const res = await fetch(`${API_BASE}/user`, { headers: headers() })
      if (!res.ok) { removeToken(); return null }
      const raw = await res.json()
      return mapUserBalance(raw)
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!getToken()
  },

  // ── Recargas ──────────────────────────────────────────────────────────────

  /** GET /api/recargas → {saldo_actual, wallet_id, transacciones[]} */
  async getRecargas(): Promise<RecargasResponse> {
    const res = await fetch(`${API_BASE}/recargas`, { headers: headers() })
    return handleResponse<RecargasResponse>(res)
  },

  /** GET /api/metodos-pago → métodos de pago activos con sus números de cuenta */
  async getMetodosPago(): Promise<MetodoPago[]> {
    const res = await fetch(`${API_BASE}/metodos-pago`, { headers: headers() })
    return handleResponse<MetodoPago[]>(res)
  },

  /** POST /api/recargas → crea solicitud de recarga (estado: PENDIENTE) */
  async createRecarga(
    monto: number,
    metodo_pago_id: number,
    referencia_pago: string
  ): Promise<{ ok: boolean; message: string; transaccion: Transaccion }> {
    const res = await fetch(`${API_BASE}/recargas`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ monto, metodo_pago_id, referencia_pago }),
    })
    return handleResponse(res)
  },

  /** POST /api/recargas/{id}/comprobante → sube imagen del comprobante */
  async uploadComprobante(
    transaccionId: number,
    file: File
  ): Promise<{ ok: boolean; comprobante_url: string }> {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/recargas/${transaccionId}/comprobante`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })
    return handleResponse(res)
  },

  // ── Compras ───────────────────────────────────────────────────────────────

  /** GET /api/compra → compras del usuario autenticado */
  async getCompras(): Promise<Compra[]> {
    const res = await fetch(`${API_BASE}/compra`, { headers: headers() })
    return handleResponse<Compra[]>(res)
  },

  /** POST /api/compra → {message, compra} */
  async createCompra(
    oferta_id: number,
    nota?: string
  ): Promise<{ message: string; compra: Compra }> {
    const res = await fetch(`${API_BASE}/compra`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ oferta_id, nota }),
    })
    return handleResponse(res)
  },

  // ── Ofertas ───────────────────────────────────────────────────────────────

  /** GET /api/oferta → lista de ofertas con servicios de streaming */
  async getOfertas(): Promise<Oferta[]> {
    const res = await fetch(`${API_BASE}/oferta`, { headers: headers() })
    return handleResponse<Oferta[]>(res)
  },

  // ── Streaming Services ────────────────────────────────────────────────────

  /** GET /api/streaming-service */
  async getStreamingServices(): Promise<StreamingService[]> {
    const res = await fetch(`${API_BASE}/streaming-service`, { headers: headers() })
    return handleResponse<StreamingService[]>(res)
  },

  // ── Admin: Transacciones ──────────────────────────────────────────────────

  /** GET /api/admin/transaccion?estado=pendiente|aprobada|rechazada */
  async getAdminTransacciones(estado?: string): Promise<AdminTransaccion[]> {
    const url = estado
      ? `${API_BASE}/admin/transaccion?estado=${estado}`
      : `${API_BASE}/admin/transaccion`
    const res = await fetch(url, { headers: headers() })
    return handleResponse<AdminTransaccion[]>(res)
  },

  /** PUT /api/admin/transaccion/{id} → aprobar o rechazar */
  async updateAdminTransaccion(
    id: number,
    estado: 'APROBADO' | 'RECHAZADO',
    comentario_admin?: string
  ): Promise<{ message: string; transaccion: Transaccion; saldo_actual_usuario: number }> {
    const res = await fetch(`${API_BASE}/admin/transaccion/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ estado, comentario_admin }),
    })
    return handleResponse(res)
  },

  // ── Admin: Wallets ────────────────────────────────────────────────────────

  /** GET /api/wallet → lista wallets con info de usuario (requiere gestionar_acceso) */
  async getWallets(): Promise<WalletWithUser[]> {
    const res = await fetch(`${API_BASE}/wallet`, { headers: headers() })
    return handleResponse<WalletWithUser[]>(res)
  },

  /** PUT /api/wallet/{id} → ajuste manual de saldo (requiere gestionar_acceso) */
  async adjustWalletBalance(
    walletId: number,
    monto: number,
    motivo: string
  ): Promise<{ message: string; wallet: WalletWithUser }> {
    const res = await fetch(`${API_BASE}/wallet/${walletId}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ monto, motivo }),
    })
    return handleResponse(res)
  },

  // ── Descuentos ────────────────────────────────────────────────────────────────

  async getDescuentos(): Promise<Descuento[]> {
    const res = await fetch(`${API_BASE}/descuento`, { headers: headers() })
    return handleResponse<Descuento[]>(res)
  },

  async deleteDescuento(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/descuento/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
  },

  // ── Streaming Services CRUD ───────────────────────────────────────────────────

  async createStreamingService(data: Partial<StreamingService>): Promise<StreamingService> {
    const res = await fetch(`${API_BASE}/streaming-service`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse<StreamingService>(res)
  },

  async updateStreamingService(id: number, data: Partial<StreamingService>): Promise<StreamingService> {
    const res = await fetch(`${API_BASE}/streaming-service/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse<StreamingService>(res)
  },

  async deleteStreamingService(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/streaming-service/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
  },

  // ── Ofertas CRUD ──────────────────────────────────────────────────────────────

  async getStockDisponible(servicio_id: number, cuenta_completa: boolean): Promise<number> {
    const res = await fetch(
      `${API_BASE}/admin/stock-disponible?servicio_id=${servicio_id}&cuenta_completa=${cuenta_completa ? 1 : 0}`,
      { headers: headers() }
    )
    const data = await handleResponse<{ stock: number }>(res)
    return data.stock
  },

  async deleteOferta(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/oferta/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
  },

  async updateOferta(id: number, data: Partial<Oferta>): Promise<Oferta> {
    const res = await fetch(`${API_BASE}/oferta/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse<Oferta>(res)
  },

  // ── Mis Cuentas (usuario) ─────────────────────────────────────────────────

  async getMisCuentas(): Promise<MiCuenta[]> {
    const res = await fetch(`${API_BASE}/mis-cuentas`, { headers: headers() })
    return handleResponse<MiCuenta[]>(res)
  },

  // ── Admin: Cuentas de Streaming ───────────────────────────────────────────

  async getAdminCuentas(): Promise<CuentaAdmin[]> {
    const res = await fetch(`${API_BASE}/admin/cuentas`, { headers: headers() })
    return handleResponse<CuentaAdmin[]>(res)
  },

  async createAdminCuenta(data: Partial<CuentaAdmin>): Promise<CuentaAdmin> {
    const res = await fetch(`${API_BASE}/admin/cuentas`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<CuentaAdmin>(res)
  },

  async updateAdminCuenta(id: number, data: Partial<CuentaAdmin>): Promise<CuentaAdmin> {
    const res = await fetch(`${API_BASE}/admin/cuentas/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<CuentaAdmin>(res)
  },

  /** POST /api/upload → sube una imagen y devuelve la URL pública */
  async uploadImagen(file: File, carpeta = 'imagenes'): Promise<string> {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('carpeta', carpeta)
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    })
    const data = await handleResponse<{ ok: boolean; url: string }>(res)
    return data.url
  },

  /** POST /api/admin/asignaciones → asigna credencial a usuario sin compra */
  async asignarCredencial(data: {
    user_id: number
    cuenta_id?: number | null
    perfil_id?: number | null
    vigencia_desde: string
    vigencia_hasta: string
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/asignaciones`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async toggleUserStatus(userId: number): Promise<{ ok: boolean; is_active: boolean }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle`, { method: 'PUT', headers: headers() })
    return handleResponse(res)
  },

  async getRoles(): Promise<Role[]> {
    const res = await fetch(`${API_BASE}/rol`, { headers: headers() })
    return handleResponse<Role[]>(res)
  },

  async createOferta(data: {
    precio: number; stock: number; garantia_dias: number
    cuenta_completa: boolean; is_active: boolean
    servicios_incluidos: Array<{ streaming_service_id: number; numero_perfiles: number; duracion_dias: number }>
  }): Promise<Oferta> {
    const res = await fetch(`${API_BASE}/oferta`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Oferta>(res)
  },

  async createDescuento(data: {
    nombre: string; codigo?: string; descripcion?: string
    fecha_inicio: string; fecha_fin?: string
    es_recurrente: boolean; is_active: boolean
    roles_asignar?: Array<{ role_id: number; valor_descuento: number; tipo_descuento: 'porcentaje' | 'fijo' }>
  }): Promise<Descuento> {
    const res = await fetch(`${API_BASE}/descuento`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Descuento>(res)
  },

  async updateDescuento(id: number, data: Partial<Parameters<typeof api.createDescuento>[0]>): Promise<Descuento> {
    const res = await fetch(`${API_BASE}/descuento/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Descuento>(res)
  },

  async deleteAdminCuenta(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/cuentas/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`)
  },

  async createAdminPerfil(cuentaId: number, data: { nombre: string; pin?: string }): Promise<PerfilAdmin> {
    const res = await fetch(`${API_BASE}/admin/cuentas/${cuentaId}/perfiles`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<PerfilAdmin>(res)
  },

  async deleteAdminPerfil(perfilId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/perfiles/${perfilId}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`)
  },

  // ─── DEPRECATED ─────────────────────────────────────────────────────────────
  // Los siguientes métodos no tienen endpoint en el backend.
  // Se mantienen para compatibilidad de UI pero no realizan llamadas reales.

  /** @deprecated Usa getUser() para obtener el saldo desde wallet.saldo */
  async getBalance(): Promise<number> {
    console.warn('[DEPRECATED] api.getBalance() - usa api.getUser() y lee user.balance')
    const user = await this.getUser()
    return user?.balance ?? 0
  },

  /** @deprecated Usa createRecarga(monto) en su lugar */
  async rechargeBalance(amount: number, _method: string): Promise<{ success: boolean; newBalance: number }> {
    console.warn('[DEPRECATED] api.rechargeBalance() - usa api.createRecarga(monto)')
    await this.createRecarga(amount)
    return { success: true, newBalance: 0 }
  },

  /** @deprecated Usa getRecargas() en su lugar */
  async getTransactions(): Promise<Transaccion[]> {
    console.warn('[DEPRECATED] api.getTransactions() - usa api.getRecargas()')
    const data = await this.getRecargas()
    return data.transacciones
  },

  /** @deprecated Usa getCompras() en su lugar. El backend no devuelve credenciales de pantallas. */
  async getMyScreens(): Promise<Screen[]> {
    console.warn('[DEPRECATED] api.getMyScreens() - usa api.getCompras(). El backend no devuelve credenciales.')
    return []
  },

  /** @deprecated No existe endpoint de actualización de perfil en el backend */
  async updateProfile(_data: Partial<User>): Promise<User> {
    console.warn('[DEPRECATED] api.updateProfile() - no existe endpoint en el backend')
    const user = await this.getUser()
    if (!user) throw new Error('Usuario no autenticado')
    return user
  },

  /**
   * @deprecated Usa createCompra(oferta_id) en su lugar.
   * El backend no gestiona credenciales de pantallas (email/password/pin).
   */
  async purchaseScreen(_product: {
    id: string; name: string; price: number; category: string; duration: string
  }): Promise<{ success: boolean; screen: Screen; newBalance: number; transaction: Transaccion }> {
    console.warn('[DEPRECATED] api.purchaseScreen() - usa api.createCompra(oferta_id)')
    throw new Error('Función deprecada. Usa api.createCompra(oferta_id) con el ID de oferta del backend.')
  },

  /** @deprecated Usa getWallets() en su lugar (retorna wallets con info de usuario) */
  async getUsers(): Promise<User[]> {
    console.warn('[DEPRECATED] api.getUsers() - usa api.getWallets()')
    const wallets = await this.getWallets()
    return wallets.map(w => ({ ...w.user, balance: w.saldo }))
  },

  /** @deprecated Usa adjustWalletBalance(walletId, monto, motivo) en su lugar */
  async addUserBalance(
    _userId: number,
    amount: number,
    description?: string
  ): Promise<{ success: boolean; newBalance: number }> {
    console.warn('[DEPRECATED] api.addUserBalance() - usa api.adjustWalletBalance(walletId, monto, motivo)')
    return { success: false, newBalance: 0 }
  },

  // ── Estrenos ───────────────────────────────────────────────────────────────

  async getEstrenos(): Promise<Estreno[]> {
    const res = await fetch(`${API_BASE}/estreno`, { headers: headers() })
    return handleResponse<Estreno[]>(res)
  },

  async createEstreno(data: {
    titulo: string; formato: 'pelicula' | 'serie'; imagen?: string
    is_active?: boolean; streaming_service_ids?: number[]
  }): Promise<Estreno> {
    const res = await fetch(`${API_BASE}/estreno`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Estreno>(res)
  },

  async updateEstreno(id: number, data: Partial<{
    titulo: string; formato: 'pelicula' | 'serie'; imagen: string
    is_active: boolean; streaming_service_ids: number[]
  }>): Promise<Estreno> {
    const res = await fetch(`${API_BASE}/estreno/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Estreno>(res)
  },

  async deleteEstreno(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/estreno/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
  },

  // ── Tutoriales ─────────────────────────────────────────────────────────────

  async getTutoriales(): Promise<Tutorial[]> {
    const res = await fetch(`${API_BASE}/tutorial`, { headers: headers() })
    return handleResponse<Tutorial[]>(res)
  },

  async createTutorial(data: {
    titulo: string; youtube_url: string; descripcion?: string
    duracion?: string; categoria_id?: number; is_active?: boolean
  }): Promise<Tutorial> {
    const res = await fetch(`${API_BASE}/tutorial`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Tutorial>(res)
  },

  async updateTutorial(id: number, data: Partial<{
    titulo: string; youtube_url: string; descripcion: string
    duracion: string; categoria_id: number | null; is_active: boolean
  }>): Promise<Tutorial> {
    const res = await fetch(`${API_BASE}/tutorial/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<Tutorial>(res)
  },

  async deleteTutorial(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/tutorial/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
  },

  // ── Categorías de tutoriales ───────────────────────────────────────────────

  async getTutorialCategorias(): Promise<TutorialCategoria[]> {
    const res = await fetch(`${API_BASE}/tutorial-categoria`, { headers: headers() })
    return handleResponse<TutorialCategoria[]>(res)
  },

  async createTutorialCategoria(data: { nombre: string; descripcion?: string; is_active?: boolean }): Promise<TutorialCategoria> {
    const res = await fetch(`${API_BASE}/tutorial-categoria`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<TutorialCategoria>(res)
  },

  async updateTutorialCategoria(id: number, data: Partial<{ nombre: string; descripcion: string; is_active: boolean }>): Promise<TutorialCategoria> {
    const res = await fetch(`${API_BASE}/tutorial-categoria/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    return handleResponse<TutorialCategoria>(res)
  },

  async deleteTutorialCategoria(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/tutorial-categoria/${id}`, { method: 'DELETE', headers: headers() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
  },

  // ── Perfil del usuario logueado ─────────────────────────────────────────────

  async updateProfile(data: { name?: string; email?: string; phone?: string | null }): Promise<User> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    const body = await handleResponse<{ ok: boolean; user: User }>(res)
    return mapUserBalance(body.user)
  },

  async changePassword(data: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/profile/password`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    })
    await handleResponse<{ ok: boolean; message: string }>(res)
  },

  // ── Settings del sitio ──────────────────────────────────────────────────────

  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, { headers: headers(false) })
    return handleResponse<SiteSettings>(res)
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(settings),
    })
    const body = await handleResponse<{ ok: boolean; settings: SiteSettings }>(res)
    return body.settings
  },
}

export default api
